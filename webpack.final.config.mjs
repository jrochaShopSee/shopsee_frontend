// webpack.final.config.mjs
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: "production", // Switch to production for the final version
    entry: "./app/shared/navigation/AdminNavFinal.tsx",
    output: {
        path: path.resolve(__dirname, "standalone"),
        filename: "admin-nav-final.js",
        library: {
            name: "AdminNavFinal",
            type: "umd",
            export: "default",
        },
        globalObject: "this",
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            target: "es5",
                            lib: ["dom", "dom.iterable", "es6"],
                            allowJs: true,
                            skipLibCheck: true,
                            strict: false,
                            noEmit: false,
                            esModuleInterop: true,
                            module: "esnext",
                            moduleResolution: "node",
                            resolveJsonModule: true,
                            isolatedModules: true,
                            jsx: "react-jsx",
                            declaration: false,
                            sourceMap: false, // Disable source maps for production
                        },
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
    },
    optimization: {
        minimize: true, // Enable minification for production
    },
};
