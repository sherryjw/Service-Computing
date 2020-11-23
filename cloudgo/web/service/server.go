package service

import (
	"net/http"
	"os"
	"github.com/urfave/negroni"
	"github.com/gorilla/mux"
	"github.com/unrolled/render"
)

func NewServer() *negroni.Negroni {
	
	formatter := render.New(render.Options{
		Directory: "templates",
		Extensions: []string{".html"},
		IndentJSON: true,
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

	mx.HandleFunc("/login", loginHandler(formatter))
	mx.HandleFunc("/game", loginHandler(formatter))
	mx.HandleFunc("/api/time", apiTimeHandler(formatter))
	mx.PathPrefix("/").Handler(http.FileServer(http.Dir(webRoot + "/assets/")))
}