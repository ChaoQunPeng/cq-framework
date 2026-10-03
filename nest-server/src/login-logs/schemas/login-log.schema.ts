import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** 管理员账号密码登录成功或失败的审计记录。 */
@Schema({
  collection: 'login_logs',
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false,
})
export class LoginLog {
  /** 保留提交的账号；账号字段缺失的非法请求以空串记录。 */
  @Prop({ default: '' })
  account!: string;

  @Prop()
  userId?: string;

  @Prop({ required: true, enum: ['success', 'failure'] })
  status!: 'success' | 'failure';

  /** 只保存业务错误说明，不保存提交的密码或令牌。 */
  @Prop()
  reason?: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  createdAt!: Date;
}

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);
/** 登录日志保留 185 天，到期后由 MongoDB TTL 索引自动删除。 */
LoginLogSchema.index(
  { createdAt: -1 },
  { expireAfterSeconds: 185 * 24 * 60 * 60 },
);
LoginLogSchema.index({ account: 1, createdAt: -1 });
