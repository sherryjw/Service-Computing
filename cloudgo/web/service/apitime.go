package service

import (
	"time"
	"net/http"

	"github.com/unrolled/render"
)

func apiTimeHandler(formatter *render.Render) http.HandlerFunc {

	return func(w http.ResponseWriter, req *http.Request) {
		formatter.JSON(w, http.StatusOK, struct{
			Time	string `json:"time"`
		}{Time: time.Now().Format(time.RFC1123)})
	}
}