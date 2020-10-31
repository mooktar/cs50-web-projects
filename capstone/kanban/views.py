import json
import time

from django.shortcuts import render, HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Projects, Boards, Cards, Tasks


def index(request):
    return render(request, "kanban/index.html")


@csrf_exempt
def login_view(request):
    if request.method == "POST":

        # Attempt to sign in user
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("projects"))
        else:
            return render(request, "kanban/login.html", {
                "message": "Invalid email and/or password."
            })
    else:
        return render(request, "kanban/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


@csrf_exempt
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "kanban/register.html", {"alert": True, "message": "Passwords must match."})

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "kanban/register.html", {"alert": True, "message": "User credentials already taken."})
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "kanban/register.html")


@login_required
def profile(request, username):
    profile = User.objects.get(username=username)
    projects, tasks = [], []
    for project in Projects.objects.all().filter(user=request.user):
        projects.append(project)
        for board in Boards.objects.all().filter(project=project.id):
            for card in Cards.objects.all().filter(board=board.id):
                for task in Tasks.objects.all().filter(card=card.id):
                    tasks.append(task)
    
    return render(request, "kanban/profile.html", {
        "profile": profile,
        "projects_count": len(projects),
        "tasks_count": len(tasks),
    })


@csrf_exempt
@login_required
def change_password(request, username):
    if request.method == "POST":
        current_password = request.POST["current-pwd"]
        new_password = request.POST["new-pwd"]

        # Authenticate user by current password
        try:
            user = authenticate(request, username=username, password=current_password)
            user.set_password(new_password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "kanban/profile.html", {"username": username, "alert": True, "error": "User not authenticated."})

        login(request, user)
        return HttpResponseRedirect(reverse("projects"))
    else:
        return render(request, "kanban/profile.html", {"alert": True, "error": "Post request required."})


@login_required
def projects(request):
    projects = Projects.objects.filter(members=request.user).order_by("timestamp")
    return render(request, "kanban/projects.html", {
        "projects": projects.reverse(),
    })


@csrf_exempt
@login_required
def add_project(request):
    if request.method != "POST":
        return JsonResponse({"alert": False, "error": "POST request required."}, status=400)

    data = json.loads(request.body)
    project = Projects(
        user=request.user,
        title=data.get("title"),
        description=data.get("description"),
        due_date=data.get("due_date"),
    )
    project.save()
    project.members.add(request.user)

    return JsonResponse({
        "alert": True,
        "message": "Project added successfully.",
        "id": project.id,
        "user": project.user.username,
        "title": project.title,
        "description": project.description,
        "due_date": project.due_date
    }, status=201)
   

@login_required
def project(request, id):
    project = Projects.objects.get(pk=id)
    users = User.objects.all().exclude(username=project.user)
    boards = Boards.objects.all().filter(project=project.id)

    all_cards = []
    board_cards = []
    for board in boards:
        cards = Cards.objects.all().filter(board=board.id)
        board_cards.append({"id": board.id, "cards": cards})
        all_cards.append(cards)

    tasks_checked = []
    for cards in all_cards:
        for card in cards:
            tasks = []
            for task in Tasks.objects.all().filter(card=card.id):
                if task.checked:
                    tasks.append(task)
            tasks_checked.append({"card_id":card.id, "checked":len(tasks)})
    
    return render(request, "kanban/project.html", {
        "project": project,
        "users": users,
        "boards": boards,
        "board_cards": board_cards,
        "tasks": tasks_checked,
    })


@csrf_exempt
@login_required
def edit_project(request, id):
    if request.method != "POST":
        return JsonResponse({"alert": False, "error": "POST request required."}, status=400)

    data = json.loads(request.body)
    try:
        project = Projects.objects.get(pk=id)
    except Projects.DoesNotExist:
        return JsonResponse({"error": "Can't get the project with this ID"}, status=400)

    project.title = data.get("title")
    project.description = data.get("description")
    project.due_date = data.get("due_date")
    project.save()

    return JsonResponse({"alert": True, "message": "Project edited successfully", "title": project.title}, status=201)


@csrf_exempt
@login_required
def complete_project(request, id):
    if request.method == "POST":
        try:
            project = Projects.objects.get(pk=id)
        except:
            return JsonResponse({"error": "Can't complete project"}, status=400)

        text = json.loads(request.body).get("text").lower()
        display = ''
        if text == "complete":
            project.completed = True
            text = "incomplete"
            display = "completed"
        elif text == "incomplete":
            project.completed = False
            text = "complete"
            display = "incompleted"
        project.save()
        return JsonResponse({"message": f"Project {display} successfuly", "text": text.capitalize()}, status=201)
    
    return JsonResponse({"alert": True, "error": "POST request required."}, status=400)


@login_required
def delete_project(request, id):
    try:
        project = Projects.objects.get(pk=id)
        project.delete()
        return HttpResponseRedirect(reverse("projects"))
    except:
        return render(request, "kanban/project.html", {
            "project": project,
            "alert": True,
            "error": "Can't delete project",
        })


@csrf_exempt
@login_required
def members(request, id):
    if request.method != "POST":
        return JsonResponse({"alert": False, "error": "POST request required."}, status=400)

    project = Projects.objects.get(pk=id)
    data = json.loads(request.body)
    action_btn = data.get("action")
    member_id = data.get("member")

    try:
        user = User.objects.get(pk=member_id)
    except User.DoesNotExist:
        return JsonResponse({"alert": False, "error": "No such user with this member username"}, status=400)

    if user not in project.members.all():
        project.members.add(user)
        action_btn = "remove"
    else:
        project.members.remove(user)
        action_btn = "add"

    return JsonResponse({
        "alert": True,
        "message": "Member added successfully.",
        "action": action_btn,
    }, status=201)


@csrf_exempt
@login_required
def add_board(request, id):
    if request.method == "POST":
        try:
            project = Projects.objects.get(pk=id)
        except Projects.DoesNotExist:
            return JsonResponse({"alert": False, "error": "Project doesn't exist!"}, status=400)

        board = Boards(project=project, name=json.loads(request.body).get("name"))
        board.save()
        return JsonResponse({"alert": True, "message": "Board added successfully.", "name": board.name, "id": board.id}, status=201)
    
    return JsonResponse({"alert": False, "error": "Post request required"}, status=400)


@csrf_exempt
@login_required
def edit_board(request, id):
    if request.method == "POST":
        try:
            board = Boards.objects.get(pk=id)
        except Boards.DoesNotExist:
            return JsonResponse({"alert": False, "error": "Board doesn't exist!"}, status=400)

        board.name=json.loads(request.body).get("name")
        board.save()
        return JsonResponse({"alert": True, "message": "Board uploded successfully.", "name": board.name}, status=201)
    
    return JsonResponse({"alert": False, "error": "Post request required"}, status=400)


@login_required
def delete_board(request, id):
    try:
        board = Boards.objects.get(pk=id)
        p_id = board.project.id
        board.delete()
        return HttpResponseRedirect(reverse("project", kwargs={"id": p_id}))
    except Boards.DoesNotExist:
        return JsonResponse({"alert": False, "error": "Board doesn't exist!"}, status=400)


@csrf_exempt
@login_required
def add_card(request, id):
    if request.method == "POST":
        try:
            board = Boards.objects.get(pk=id)
        except Boards.DoesNotExist:
            return JsonResponse({"alert": False, "error": "Boards doesn't exist!"}, status=400)

        data = json.loads(request.body)
        card = Cards(
            user=request.user,
            board=board,
            name=data.get("name"),
            description=data.get("description")
            )
        card.save()
        return JsonResponse({
            "alert": True,
            "message": "Card added successfully.",
            "id": card.id,
            "name": card.name,
            "description": card.description,
            }, status=201)
    
    return JsonResponse({"alert": False, "error": "Post request required"}, status=400)


@csrf_exempt
@login_required
def edit_card(request, id):
    if request.method == "POST":
        try:
            card = Cards.objects.get(pk=id)
        except Cards.DoesNotExist:
            return JsonResponse({"alert": False, "error": "Cards doesn't exist!"}, status=400)

        data = json.loads(request.body)
        card.name = data.get("name")
        card.description = data.get("description")
        card.save()
        return JsonResponse({
            "alert": True,
            "message": "Card edited successfully.",
            "id": card.id,
            "name": card.name,
            "description": card.description,
            }, status=201)
    
    return JsonResponse({"alert": False, "error": "Post request required"}, status=400)


@login_required
def delete_card(request, id):
    try:
        card = Cards.objects.get(pk=id)
    except Cards.DoesNotExist:
        return JsonResponse({"alert": False, "error": "Card doesn't exist!"}, status=400)
    
    board = Boards.objects.get(pk=card.board.id)
    p_id = board.project.id
    card.delete()
    return HttpResponseRedirect(reverse("project", kwargs={"id": p_id}))


@csrf_exempt
@login_required
def drop_card(request, id):
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            card = Cards.objects.get(pk=id)
            board = Boards.objects.get(pk=data.get("board_id"))
        except Boards.DoesNotExist:
            return JsonResponse({"alert": False, "error": "Card or Board doesn't exist!"}, status=400)
    
        card.board = board
        card.save()
        return JsonResponse({"board_id": board.id}, status=201)
    
    return JsonResponse({"alert": False, "error": "Post request required"}, status=400)


@login_required
def upload_tasks(request, id):
    try:
        card = Cards.objects.get(pk=id)
    except Cards.DoesNotExist:
        return JsonResponse({"alert": False, "error": "Card doesn't exist!"}, status=400)

    all_tasks = []
    for task in Tasks.objects.all().filter(card=card.id):
        all_tasks.append({"id":task.id, "card_id":task.card.id, "body":task.body, "checked":task.checked})
    return JsonResponse({"tasks": all_tasks}, status=201)


@csrf_exempt
@login_required
def add_task(request, id):
    if request.method == "POST":
        try:
            card = Cards.objects.get(pk=id)
        except Cards.DoesNotExist:
            return JsonResponse({"alert": False, "error": "Card doesn't exist!"}, status=400)

        task = Tasks(body=json.loads(request.body).get("body"), card=card)
        task.save()
        return JsonResponse({"id": task.id, "body": task.body, "checked": task.checked, "card_id":task.card.id}, status=201)
    
    return JsonResponse({"alert": False, "error": "Post request required"}, status=400)


@login_required
def complete_task(request, id):
    try:
        task = Tasks.objects.get(pk=id)
    except Tasks.DoesNotExist:
        return JsonResponse({"alert": False, "error": "Task doesn't exist!"}, status=400)
    
    if task.checked == True:
        task.checked = False
    elif task.checked == False:
        task.checked = True
    task.save()
    return JsonResponse({"checked": task.checked}, status=201)



@csrf_exempt
@login_required
def search_view(request):
    query = ''
    if request.method == "POST":
        results = {"projects": [], "cards": []}
        query = request.POST["query"]
        if not query:
            results["projects"].append(Projects.objects.filter(user=request.user))
            results["cards"].append(Cards.objects.filter(user=request.user))
            return HttpResponseRedirect(reverse("projects"))
        else:
            projects_by_title = Projects.objects.filter(title__icontains=query)
            projects_by_description = Projects.objects.filter(description__icontains=query)
            if projects_by_title.exists() and projects_by_description.exists():
                for pbt in projects_by_title:
                    results["projects"].append(pbt)
                    for pbd in projects_by_description:
                        if pbd not in projects_by_title:
                            results["projects"].append(pbd)
            cards_by_title = Cards.objects.filter(name__icontains=query)
            cards_by_description = Cards.objects.filter(description__icontains=query)
            if cards_by_title.exists() and cards_by_description.exists():
                for cbt in cards_by_title:
                    results["cards"].append(cbt)
                    for cbd in cards_by_description:
                        if cbd not in cards_by_title:
                            results["cards"].append(cbd)
            return render(request, "kanban/search.html", {"query": query, "projects":results["projects"], "cards":results["cards"]})
