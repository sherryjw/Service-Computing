package service

import (
	"net/http"
	"github.com/unrolled/render"
)

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