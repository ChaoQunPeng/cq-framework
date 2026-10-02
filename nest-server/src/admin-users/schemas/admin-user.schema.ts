import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AdminRole } from '../../admin-roles/schemas/admin-role.schema';

export type AdminUserDocument = HydratedDocument<AdminUser>;

/** 后台管理员账号可用状态。 */
export const ADMIN_USER_STATUSES = ['active', 'disabled'] as const;
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

@Schema({
  collection: 'admin_users',
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_document, result) => {
      const serialized = result as typeof result & { password?: string };
      const {
        _id: _ignoredId,
        password: _ignoredPassword,
        ...user
      } = serialized;
      return user;
    },
  },
})
export class AdminUser {
  /** 后台登录用户名。 */
  @Prop({ required: true, unique: true, trim: true, maxlength: 30 })
  username!: string;

  /** 后台用户登录和联系使用的手机号。 */
  @Prop({ required: true, unique: true, match: /^1\d{10}$/ })
  phone!: string;

  /** 仅保存密码哈希，查询用户资料时默认不返回。 */
  @Prop({ required: true, select: false, maxlength: 100 })
  password!: string;

  /** 用户拥有的后台角色 ID；多角色权限由后续鉴权阶段合并。 */
  @Prop({
    type: [Types.ObjectId],
    ref: AdminRole.name,
    required: true,
  })
  roleIds!: Types.ObjectId[];

  /** 控制管理员能否登录以及继续调用后台接口。 */
  @Prop({
    type: String,
    required: true,
    enum: ADMIN_USER_STATUSES,
    default: 'active',
  })
  status!: AdminUserStatus;

  /** 用户创建时间，由 Mongoose timestamps 自动生成。 */
  createdAt!: Date;

  /** 用户最后更新时间，由 Mongoose timestamps 自动维护。 */
  updatedAt!: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
