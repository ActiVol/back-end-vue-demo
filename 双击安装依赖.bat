@echo off
echo 正在尝试使用npm安装...
npm i
if %errorlevel% neq 0 (
    echo npm安装失败，尝试使用cnpm安装...
    cnpm i
    if %errorlevel% neq 0 (
        echo cnpm安装失败，尝试使用pnpm安装...
        pnpm i
        if %errorlevel% neq 0 (
            echo 所有安装方式均失败！
        ) else (
            echo pnpm安装成功！
        )
    ) else (
        echo cnpm安装成功！
    )
) else (
    echo npm安装成功！
)
pause