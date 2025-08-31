@echo off
title NPM dev Starter
echo Starting npm run dev...

:: 尝试npm run dev
cmd /c "npm run dev"
if %errorlevel% neq 0 (
    echo npm run dev failed, trying npm run serve...
    cmd /c "npm run serve"
    if %errorlevel% neq 0 (
        echo npm run serve failed, trying cnpm run dev...
        cmd /c "cnpm run dev"
        if %errorlevel% neq 0 (
            echo cnpm run dev failed, trying cnpm run serve...
            cmd /c "cnpm run serve"
            if %errorlevel% neq 0 (
                echo cnpm run serve failed, trying pnpm run dev...
                cmd /c "pnpm run dev"
                if %errorlevel% neq 0 (
                    echo pnpm run dev failed, trying pnpm run serve...
                    cmd /c "pnpm run serve"
                    if %errorlevel% neq 0 (
                        echo All run attempts failed!
                    ) else (
                        echo pnpm run serve started successfully.
                    )
                ) else (
                    echo pnpm run dev started successfully.
                )
            ) else (
                echo cnpm run serve started successfully.
            )
        ) else (
            echo cnpm run dev started successfully.
        )
    ) else (
        echo npm run serve started successfully.
    )
) else (
    echo npm run dev started successfully.
)

pause
