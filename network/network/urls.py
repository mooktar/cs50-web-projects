
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("add", views.add_post, name="addpost"),
    path("user/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    path("edit/<int:post_id>", views.edit_post, name="editpost"),
    path("like", views.like_post, name="likepost"),
    path("follow", views.follow, name="follow"),
]
