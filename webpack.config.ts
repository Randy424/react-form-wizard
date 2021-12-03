/* eslint-disable i18next/no-literal-string */
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import ReactRefreshTypeScript from 'react-refresh-typescript'
import webpack from 'webpack'
import { Configuration as DevServerConfiguration } from 'webpack-dev-server'

module.exports = function (_env: unknown, argv: { hot: boolean; mode: string | undefined }) {
    const isProduction = argv.mode === 'production' || argv.mode === undefined
    const isDevelopment = !isProduction

    const config: webpack.Configuration & { devServer: DevServerConfiguration } = {
        entry: './examples',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
            alias: { handlebars: 'handlebars/dist/handlebars.js' },
        },
        module: {
            rules: [
                { test: /\.(hbs|yaml)$/, type: 'asset/source' },
                { test: /\.(svg)$/, use: '@svgr/webpack' },
                { test: /\.(jpg|jpeg|png|gif|ttf|eot|woff|woff2)$/, type: 'asset/resource' },
                {
                    test: /\.css$/,
                    use: isDevelopment ? ['style-loader', 'css-loader'] : [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    exclude: /node_modules/,
                    loader: 'ts-loader',
                    options: {
                        configFile: isDevelopment ? 'tsconfig.dev.json' : 'tsconfig.json',
                        transpileOnly: true,
                        getCustomTransformers: () => ({
                            before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
                        }),
                    },
                    type: 'javascript/auto',
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': isProduction ? JSON.stringify('production') : JSON.stringify('development'),
            }),
            isProduction && new CompressionPlugin({ algorithm: 'gzip' }),
            isDevelopment && new ReactRefreshWebpackPlugin(),
            new HtmlWebpackPlugin({ title: 'Form Wizard', favicon: 'examples/assets/favicon.svg' }),
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash:8].css',
                chunkFilename: '[id].[contenthash:8].css',
                ignoreOrder: false, // Enable to remove warnings about conflicting order
            }),
        ].filter(Boolean) as webpack.WebpackPluginInstance[],
        output: {
            publicPath: isProduction ? '/react-form-wizard/' : '/',
        },
        optimization: {
            minimizer: [
                `...`,
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: ['default', { mergeLonghand: false }],
                    },
                }),
            ],
        },
        devServer: {
            port: 3000,
            open: true,
            historyApiFallback: true,
            compress: true,
            hot: true,
        },
        devtool: 'source-map',
    }

    return config
}