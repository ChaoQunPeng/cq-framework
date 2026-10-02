import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import { AdminPermissionsService } from '../src/admin-permissions/admin-permissions.service';
import { AdminRolesService } from '../src/admin-roles/admin-roles.service';
import { AdminUser } from '../src/admin-users/schemas/admin-user.schema';

const logger = new Logger('Seed');

/**
 * 幂等写入首次登录使用的默认管理员账号，并关联超级管理员角色。
 * 重复执行时保留已存在的管理员资料，不覆盖用户已经修改过的密码。
 */
async function seedDefaultAdmin(
  adminUserModel: Model<AdminUser>,
  superAdminRoleId: Types.ObjectId,
) {
  // 默认管理员账号来自环境变量，便于不同环境使用各自的初始账号。
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const phone = process.env.SEED_ADMIN_PHONE ?? '13800000000';
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  // 未显式设置密码时停止初始化，避免创建使用公开默认密码的超级管理员。
  if (!seedPassword) {
    throw new Error('运行 seed 前必须配置 SEED_ADMIN_PASSWORD');
  }
  const password = await bcrypt.hash(seedPassword, 12);

  await adminUserModel
    .updateOne(
      { $or: [{ username }, { phone }] },
      {
        $setOnInsert: {
          username,
          phone,
          password,
          roleIds: [superAdminRoleId],
          status: 'active',
        },
      },
      { upsert: true },
    )
    .exec();
}

/** 创建无 HTTP 监听的 Nest 上下文，执行种子任务后释放数据库连接。 */
async function runSeed() {
  const applicationContext = await NestFactory.createApplicationContext(
    AppModule,
  );

  try {
    const adminUserModel = applicationContext.get<Model<AdminUser>>(
      getModelToken(AdminUser.name),
    );
    const adminPermissionsService = applicationContext.get(
      AdminPermissionsService,
    );
    const adminRolesService = applicationContext.get(AdminRolesService);

    await adminPermissionsService.initializeSystemPermissions();
    const superAdminRole = await adminRolesService.initializeSystemRoles();
    await seedDefaultAdmin(adminUserModel, superAdminRole._id);
    logger.log('默认管理员、系统权限和系统角色种子数据处理完成');
  } finally {
    await applicationContext.close();
  }
}

void runSeed().catch((error: unknown) => {
  logger.error('种子数据处理失败', error);
  process.exitCode = 1;
});
