# 开发说明
###### edit by LASTiMP
* 新添加的block-lua转换模块在src\components\generate-Lua中，lua代码生成逻辑在sortCode.jsx中
* sources里储存的是经过处理后的lua源代码
* FileSaver是引入的一个提供文件保存支持的js库，比FSO有更好的兼容性
* generate-Lua的css文件，jsx文件和icon-generate-Lua.svg用于生成额外的按钮，如果决定把生成代码
的功能并入绿旗，可以删除这三个文件，并同时用搜索功能搜索“lua”调整两个control文件及其他的相关文件
* sortCode.jsx提供了主要的lua代码生成方法
