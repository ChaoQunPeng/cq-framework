import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** 管理员对用户、角色执行成功写操作后保存的审计记录。 */
@Schema({
  collection: 'operation_logs',
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class OperationLog {
  /** 操作者 ID 和用户名均保存快照，账号删除后日志仍可识别。 */
  @Prop({ required: true })
  operatorId!: string;

  @Prop({ required: true })
  operatorName!: string;

  /** 稳定动作编码及展示名称由接口上的日志标记提供。 */
  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  description!: string;

  /** 只保存业务对象 ID，不保存可能含密码的请求或响应正文。 */
  @Prop()
  targetId?: string;

  @Prop({ required: true })
  path!: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  createdAt!: Date;
}

export const OperationLogSchema = SchemaFactory.createForClass(OperationLog);
/** 操作日志保留 365 天，到期后由 MongoDB TTL 索引自动删除。 */
OperationLogSchema.index(
  { createdAt: -1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 },
);
OperationLogSchema.index({ operatorName: 1, createdAt: -1 });
