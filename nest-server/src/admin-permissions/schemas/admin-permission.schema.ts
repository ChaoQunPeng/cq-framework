import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminPermissionDocument = HydratedDocument<AdminPermission>;

/**
 * 系统权限模型。
 * name 用于后台展示，code 是接口权限校验使用的稳定业务标识。
 */
@Schema({
  collection: 'admin_permissions',
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_document, result) => {
      // 对外接口统一返回 id，角色仍使用 MongoDB ObjectId 建立关联。
      const { _id: _ignoredId, ...permission } = result;
      return permission;
    },
  },
})
export class AdminPermission {
  /** 后台界面展示的权限名称。 */
  @Prop({ required: true, trim: true, maxlength: 30 })
  name!: string;

  /** 程序进行权限判断的唯一编码，格式为“资源:操作”。 */
  @Prop({ required: true, unique: true, trim: true, maxlength: 50 })
  code!: string;

  /** 权限创建时间，由 Mongoose timestamps 自动生成。 */
  createdAt!: Date;

  /** 权限最后更新时间，由 Mongoose timestamps 自动维护。 */
  updatedAt!: Date;
}

export const AdminPermissionSchema =
  SchemaFactory.createForClass(AdminPermission);
