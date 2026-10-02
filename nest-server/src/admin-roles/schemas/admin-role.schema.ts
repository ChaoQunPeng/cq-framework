import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AdminPermission } from '../../admin-permissions/schemas/admin-permission.schema';

export type AdminRoleDocument = HydratedDocument<AdminRole>;

/**
 * 后台角色模型。
 * code 是程序识别角色的稳定标识，permissionIds 记录角色拥有的系统权限。
 */
@Schema({
  collection: 'admin_roles',
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_document, result) => {
      // 对外接口统一返回 id，权限关联仍使用 MongoDB ObjectId 持久化。
      const { _id: _ignoredId, ...role } = result;
      return role;
    },
  },
})
export class AdminRole {
  /** 后台界面展示的角色名称。 */
  @Prop({ required: true, unique: true, trim: true, maxlength: 30 })
  name!: string;

  /** 程序引用角色的唯一编码。 */
  @Prop({ required: true, unique: true, trim: true, maxlength: 30 })
  code!: string;

  /** 角色拥有的权限 ID；空数组表示该角色暂未分配任何权限。 */
  @Prop({
    type: [Types.ObjectId],
    ref: AdminPermission.name,
    required: true,
    default: [],
  })
  permissionIds!: Types.ObjectId[];

  /** 角色创建时间，由 Mongoose timestamps 自动生成。 */
  createdAt!: Date;

  /** 角色最后更新时间，由 Mongoose timestamps 自动维护。 */
  updatedAt!: Date;
}

export const AdminRoleSchema = SchemaFactory.createForClass(AdminRole);
