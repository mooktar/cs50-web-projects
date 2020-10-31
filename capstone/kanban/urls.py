from django.urls import path
from . import views

# app_name = "kanban"
urlpatterns = [
    path("", views.index, name="index"),

    # User
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.profile, name="setting"),
    path("user/<str:username>/edit", views.change_password, name="change password"),

    # Projects
    path("projects", views.projects, name="projects"),
    path("projects/add", views.add_project, name="add project"),
    path("projects/<int:id>", views.project, name="project"),
    path("projects/<int:id>/edit", views.edit_project, name="edit project"),
    path("projects/<int:id>/complete", views.complete_project, name="complete project"),
    path("projects/<int:id>/delete", views.delete_project, name="delete project"),

    # Members
    path("projects/<int:id>/members", views.members, name="members"),
    
    # Boards
    path("projects/<int:id>/boards/add", views.add_board, name="add board"),
    path("boards/<int:id>/edit", views.edit_board, name="edit board"),
    path("boards/<int:id>/delete", views.delete_board, name="delete board"),

    # Cards
    path("boards/<int:id>/cards/add", views.add_card, name="add card"),
    path("cards/<int:id>/edit", views.edit_card, name="edit card"),
    path("cards/<int:id>/delete", views.delete_card, name="delete card"),
    path("cards/<int:id>/drop", views.drop_card, name="drop card"),

    # Tasks
    path("cards/<int:id>/tasks", views.upload_tasks, name="all task"),
    path("cards/<int:id>/tasks/add", views.add_task, name="add task"),
    path("tasks/<int:id>/complete", views.complete_task, name="complete task"),

    # Search
    path("search", views.search_view, name="search"),
]
