import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ token, css }) => ({
  footer: css`
    padding: 16px 24px;
    text-align: center;
    color: ${token.colorTextDescription};
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeight};
  `,
}));

/** 管理端页脚只展示当前框架标识，避免沿用原项目的品牌和仓库地址。 */
const Footer: React.FC = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.footer}>
      CQ Framework &copy; {new Date().getFullYear()}
    </div>
  );
};

export default Footer;
