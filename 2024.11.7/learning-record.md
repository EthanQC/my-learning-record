## 一些知识
### HTML
HTML，全称HyperText Markup Language，是一种用来排版网页的语言

它并不是编程性质的语言，所以相对来说上手会很快（即使没有学过cpp之类的），它更多的还是跟CSS和JavaScript一起对整个网页进行排版、布局和美化

值得注意的是，这三件套（**HTML、CSS、JavaScript**）只是前端基础中的基础，后面的一些常用框架应该才是重头戏

#### `<p> </p>`
段落标识符，中间可填入想要呈现的内容（字），两个是配套的，后面那个别忘了打斜杠

**p**指的就是paragraph，如果将p换成`em`、`strong`，就分别是*斜体*和**加粗**的效果，一般是加在内容中某个想要特定效果的字左右，把那个字包起来

这个操作称为`nesting elements`，还是挺形象的，e.g.`<p>My cat is <strong>very</strong> grumpy.</p>`

#### `<img>`
图片标识符，用来在页面中插入图片，一般需要配合`src`属性和`alt`属性使用，src后面放图片链接（一般是网上现成的，上传到GitHub中比如，或本地的），alt后面放图片说明

e.g.`<img src="your links" alt="your description" />`

一般是需要在结尾加个斜杠的，要注意它并不是像段落标识符那样成双成对的，它很孤独，嗯

#### `<a> </a>`
链接标识符，可以在页面中插入超链接，并自定义名字，跟markdown的功能差不多

e.g.`<a href="your links">favorite website</a>`

`href`是它的独特属性，全称是**hyperlink reference**，在这里“favorite website”就是超链接的名字

#### 元素和属性
尖括号`<>`中包含的，比如p、img等，我们称为元素（elements），跟在元素后面（用空格分割）的，如src、alt，我们称为属性（名）（attributes）

属性有自己的值，值被双引号或单引号（不能混用）包裹，跟属性中间用等号连接，有些值是独特的，也有些值只是用来标注，方便使用CSS统一格式

>图片常用属性还有`width`和`height`
>input也是一种元素，属性有type和disabled，可以创建输入框让用户输入或禁止输入（等以后实际用到了再细说）

#### 一个简单的HTML标准模板

    <!doctype html>
    <html lang="en-US">
      <head>
        <meta charset="utf-8" />
        <title>My test page</title>
      </head>
      <body>
        <h1>this is h1</h1>
        <p>This is my page</p>
      </body>
    </html>

`<!doctype html>`：一种类似于c++头文件的东西，地位相当于标准输入输出流？反正很重要，是为了用来确保HTML代码能正常被渲染的

`<html lang="en-US"> </html>`：特殊元素，包裹了整个HTML代码，有点像main函数（但这两个是完全不一样的，我指的是地位），lang属性代表的是语言

`<head> </head>`：特殊元素，用来包裹所有的参数、连接（比如连接CSS和JavaScript）或调试信息，这里面的内容是不会显示在页面中的

`<body> </body>`：特殊元素，用来包裹想要在页面中展现的一切，比如文字、表格、图片、链接等等

`<meta charset="utf-8" />`：特殊元素，meta是指元数据，但具体的作用我目前也不太清楚，只知道后面的`charset="utf-8"`的作用也是类似于前置工作，能确保你在段落中输入的绝大部分内容不会出错

`<title>My test page</title>`：特殊元素，就是显示在标签栏和收藏栏的名字

`<h1>this is h1</h1>`：特殊元素，表示标题，可以通过创建多个（如h2、h3、h4）来表示多级标题

#### 注释
在HTML中，写注释的方法是`<!-- your comments -->`，我觉得还是挺麻烦的，嗯，非常麻烦

### 文件管理
推荐阅读[这篇文章](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/Dealing_with_files)，我觉得写得非常好，能帮助我们这样的初学者建立一个在前端中很好的文件管理体系

## 碎碎念
