# 开发简单 web 服务程序 cloudgo

## 目录

- [开发简单 web 服务程序 cloudgo](#开发简单-web-服务程序-cloudgo)
  - [目录](#目录)
    - [任务概述](#任务概述)
    - [最终成果](#最终成果)
    - [实现流程](#实现流程)
    - [curl测试](#curl测试)
    - [ab测试](#ab测试)
    - [扩展](#扩展)


### 任务概述
1、开发类似 cloudgo 应用的 web 服务程序，要求：
- 支持静态文件服务
- 支持简单 js 访问
- 提交表单，并输出一个表格（必须使用模板）

2、使用 curl 测试，将测试结果写入 README.md<br/>
3、使用 ab 测试，将测试结果写入 README.md，并解释重要参数<br/>

### 最终成果

&emsp;&emsp;实现了一个带登录信息提交和小游戏的 web 服务程序，同时支持静态文件服务和简单 js 访问：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-012.png)<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-011.png)<br/>

### 实现流程

- 创建一个 web 服务器

&emsp;&emsp;参考 [pmlpml/golang-learning/web](https://github.com/pmlpml/golang-learning/blob/master/web/cloudgo-static/main.go) 编写main.go，启动一个服务器，并监听指定端口：<br/>
``main.go``
```go
const (
    RT string = "8080"
)

func main() {
    port := os.Getenv("PORT")
    if len(port) == 0 {
        port = PORT
    }

    pPort := flag.StringP("port", "p", "PORT", "PORT for http listening")
    flag.Parse()
    if len(*pPort) != 0 {
        port = *pPort
    }

    server := service.NewServer()
    server.Run(":" + port)
}
```

&emsp;&emsp;编写server.go，完成对服务器的初始化，包括新建一个render，使能够渲染多种格式的 web 内容；一个 negroni，通过调用其自身的中间件来完成对各种 HTTP Request 的处理，即充当一个接口；一个 mux.Router 使能够根据已注册路由列表匹配传入请求，并调用与指定 url 等条件匹配的路由的处理程序：<br/>
``server.go``
```go
func NewServer() *negroni.Negroni {	
    formatter := render.New(render.Options{
        Directory: "templates",
        Extensions: []string{".html"},
        IndentJSON: true
    })

    n := negroni.Classic()
    mx := mux.NewRouter()

    initRoutes(mx, formatter)

    n.UseHandler(mx)
    return n
}

func initRoutes(mx *mux.Router, formatter *render.Render) {
    webRoot := os.Getenv("WEBROOT")
    if len(webRoot) == 0 {
        if root, err := os.Getwd(); err != nil {
            panic("Could not retrive working directory")
        } else {
            webRoot = root
        }
    }
}
```
&emsp;&emsp;执行``go run main.go -p 8080``运行程序，在浏览器访问``http://localhost:8080``：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-001.png)<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-002.png)<br/>
&emsp;&emsp;404！这表明我们成功地连接了服务器，只是我们请求的页面并不存在，这是因为我们还没有为访问的 url 指定资源。<br/>

---

- 支持静态文件服务

&emsp;&emsp;http/net 提供了现成的方法``func FileServer(root FileSystem) Handler``来访问文件系统：<br/>
```go
mx.PathPrefix("/").Handler(http.FileServer(http.Dir(webRoot + "/assets/")))
```

&emsp;&emsp;将这行代码添加到 server.go 中，重新运行，访问``http://localhost:8080``：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-003.png)<br/>
&emsp;&emsp;成功地访问到了 /assets/ 下的文件列表，点击文件列表中的文件：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-004.png)<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-006.png)<br/>
&emsp;&emsp;文本内容和图片资源都可以直接看到！

---

- 支持简单 js 访问

&emsp;&emsp;根据 TA 的解释，支持简单 js 访问的核心实现是使 html 文件能够利用 js 脚本通过路由访问后端服务器来获得最新数据，因此首先需要有一个展示数据的页面和对应的脚本：<br/>
``login.html``
```html
<html>
<head>
    <link rel="stylesheet" href="css/login.css"/>
    <link rel="icon" href="images/user.svg" type="image/svg"/>
    <script src="js/jquery-latest.js"></script>
    <script src="js/login.js"></script>
    <title>Sign in</title>
    </head>
    <body>
    <p class="time">Visit Time: </p>
    <div class="mainContainer">
        <h1>Sign in to Puzzle Game</h1>
        <div class="formContainer">
            <form action="/game" method="post">
                <input class="info" type="text" name="username" placeholder="Username">
                <input class="info" type="text" name="account" placeholder="Account">
                <input class="info" type="password" name="password" placeholder="Password">
                <input class="button" type="submit" value="login">
            </form>
        </div>
    </div>
</body>
</html>
```

``login.js``
```js
$(document).ready(function() {
    $.ajax({
        url: "/api/time"
    }).then(function(data) {
       $('.time').append(data.time);
    });
});
```

&emsp;&emsp;login.js 使用 ajax() 方法通过 HTTP 请求加载/api/time 的远程数据，这里并不是真的要访问该路径下的资源，我们的目的是将为这个访问指定一个 Handler，使其能够返回数据给脚本。修改 server.go 如下：<br/>
``server.go``
```go
func initRoutes(mx *mux.Router, formatter *render.Render) {
	/* ... */

    mx.HandleFunc("/login", loginHandler(formatter))
    mx.HandleFunc("/api/time", apiTimeHandler(formatter))
    mx.PathPrefix("/").Handler(http.FileServer(http.Dir(webRoot + "/assets/")))
}
```

&emsp;&emsp;定义 loginHandler 和 apiTimeHandler如下：<br/>
``login.go``
```go
func loginHandler(formatter *render.Render) http.HandlerFunc {
    return func(w http.ResponseWriter, req *http.Request) {
        formatter.HTML(w, http.StatusOK, "login", nil)
    }
}
```
&emsp;&emsp;loginHandler 返回一个匿名结构，其中包含一个由 render 渲染``login.html``的 HTML 对象。<br/>

``apitime.go``
```go
func apiTimeHandler(formatter *render.Render) http.HandlerFunc {
    return func(w http.ResponseWriter, req *http.Request) {
        formatter.JSON(w, http.StatusOK, struct{
            Time    string `json:"time"`
        }{Time: time.Now().Format(time.RFC1123)})
    }
}
```
&emsp;&emsp;apiTimeHandler 返回一个匿名结构，其中包含一个由 render 进行 JSON 序列化后的当前时间的数据对象。<br/>
&emsp;&emsp;访问``http://localhost:8080/login``：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-010.png)<br/>
&emsp;&emsp;可以看到每刷新一次页面时左上角的时间显示也会同步刷新，显示的时间即为刷新瞬间的时刻（忽略脚本调用的时间差）。<br/>
&emsp;&emsp;login.html 还包含了一个表单，尽管我们为表单的提交设置了跳转路径，但此时点击提交：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-008.png)<br/>
&emsp;&emsp;页面不存在，这意味着我们需要为实现表单提交再多做一些事情。<br/>

---

- 提交表单，并输出一个表格（使用模板）

&emsp;&emsp;首先向 /assets/templates/ 下增加 game.html，这是一个以前制作的小游戏页面，略微修改使其能实现表单输出：<br/>
``game.html``
```html
<html>
<head>
    <meta charset = "utf-8">
    <title>Puzzle</title>
    <link rel="stylesheet" type="text/css" href="css/puzzle.css">
    <link rel="icon" href="images/game.svg" type="image/svg"/>
    <script type="text/javascript" src="js/puzzle.js"></script>
</head>
<body>
    <div>
        <p>Username: {{.Username}}</p>
        <p>Account: {{.Account}}</p>
    </div>
    <h1>Fifteen Puzzle</h1>
    <p id="win">You win!</p>	
    <div id="puzzle"><div id="tip"><img src="images/frame3.png"></div></div>
    <div id="control">
        <button id="reset"> Start </button>
        <button id="change"> Switch </button>
    </div>
</body>
</html>
```
&emsp;&emsp;其中``{{.Username}}``和``{{.Account}}``是指明了属性的待填充的信息，这些信息在表单提交时被包含在 POST 请求中，因此为了获得这部分信息并完成填充，需要修改 loginHandler：<br/>
``login.go``
```go
func loginHandler(formatter *render.Render) http.HandlerFunc {
    return func(w http.ResponseWriter, req *http.Request) {
        if req.Method == "GET" {
            formatter.HTML(w, http.StatusOK, "login", nil)

        } else {
            req.ParseForm()
            formatter.HTML(w, http.StatusOK, "game", struct{
                Username 	string
                Account 	string
            }{Username: req.Form["username"][0], Account: req.Form["account"][0]})
        }
    }
}
```
&emsp;&emsp;当服务器接收到的是 GET 请求时，表示这是一个普通的页面访问，返回 login 页面即可；当接收到的是 POST 请求时，意味着页面内的表单提交被触发，服务器需要解析 POST 请求中的字段，得到的信息由 formatter 的 HTML 注入模板，输出到浏览器。<br/>
&emsp;&emsp;为 game.html 指定 Handler：<br/>
``server.go``
```go
func initRoutes(mx *mux.Router, formatter *render.Render) {
    /* ... */
    mx.HandleFunc("/game", loginHandler(formatter))
}
```
&emsp;&emsp;再次访问``http://localhost:8080/login``，这次提交表单后：<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-012.png)<br/>
&emsp;&emsp;![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-011.png)<br/>
&emsp;&emsp;表单数据被输出到了页面左上角（密码是保密字段，不输出），成功！接下来可以快乐划水玩小游戏了~<br/>

### curl测试

&emsp;&emsp;curl 命令可以向服务器发送请求，然后获取数据并打印，帮助调试服务器的运行程序。使用不同的参数可以实现不同的功能，这里主要使用``-v``和``-d``，前者可以显示一次 http 通信的整个过程，包括端口连接和 http 请求的头信息，后者用来指定发送 POST 请求的数据（省略``-X``，默认发送 POST 请求）<br/>
- 以 GET 方式访问静态文件列表<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-013.png)<br/>
- 以 GET 方式访问静态文件<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-019.png)<br/>

- 以 GET 方式访问登录页面<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-015.png)<br/>
- 以 POST 方式访问登录页面（返回跳转目标页）<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-016.png)<br/>


- 以 GET 方式访问游戏页面（返回表单提交页）<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-014.png)<br/>
- 以 POST 方式访问游戏页面<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@v1.6.0/image/sc-hw7-018.png)<br/>

### ab测试

&emsp;&emsp;ab 测试是一种网络压力测试，其命令的基本参数是``-n``和``-c``，前者指定执行请求的数量，后者指定并发的请求数。<br/>
&emsp;&emsp;对压力测试的结果重点关注吞吐率（Requests per second）和用户平均请求等待时间（Time per request）指标：<br/>

- 对静态文件访问请求的压力测试<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-020.png)<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-024.png)<br/>

- 对登录页面访问请求的压力测试<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-022.png)<br/>
![](https://cdn.jsdelivr.net/gh/sherryjw/StaticResource@master/image/sc-hw7-025.png)<br/>

### 扩展

- 阅读 net/http 库的源码，分析 web 工作原理。（以博客形式呈现）

[🔗博客链接](https://www.yuque.com/pijiuwujializijun/mlnoxf/nxgyax)
