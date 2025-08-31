@echo off
echo 正在尝试使用npm构建Vue项目...
npm run build:prod
if %errorlevel% equ 0 (
    echo 使用npm构建成功！
    goto end
)

echo npm构建失败，尝试使用cnpm构建...
cnpm run build:prod
if %errorlevel% equ 0 (
    echo 使用cnpm构建成功！
    goto end
)

echo cnpm构建失败，尝试使用pnpm构建...
pnpm run build:prod
if %errorlevel% equ 0 (
    echo 使用pnpm构建成功！
    goto end
)

echo pnpm构建失败，尝试使用yarn构建...
yarn run build:prod
if %errorlevel% equ 0 (
    echo 使用yarn构建成功！
    goto end
)

echo 所有构建方式均失败，尝试使用npm run build...
npm run build
if %errorlevel% equ 0 (
    echo 使用npm run build构建成功！
    goto end
)

echo 所有构建方式均失败，请检查项目配置和包管理器安装情况。
pause
exit /b 1

:end
echo 构建完成！
pause
