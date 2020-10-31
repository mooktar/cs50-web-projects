from django.urls import path

from . import views

app_name = "encyclopedia"
urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.wiki, name="wiki"),
    path("create/", views.create, name="create"),
    path("wiki/<str:title>/edit", views.edit, name="edit"),
]
