-- 关闭邮件确认功能
-- 执行此 SQL 后，用户注册后可以直接登录，不需要确认邮件

UPDATE auth.config
SET email_autoconfirm = true
WHERE true;
