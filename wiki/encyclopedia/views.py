import markdown2
import random

from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
from . import util


class CreateNewEntry(forms.Form):
    title = forms.CharField(label="", widget=forms.TextInput(
        attrs={'class': 'form-control', 'placeholder': 'Entry title'}))
    content = forms.CharField(label="", widget=forms.Textarea(
        attrs={'class': 'form-control my-3', 'placeholder': "Entry content ..."}))
    edit = forms.BooleanField(
        initial=False, widget=forms.HiddenInput(), required=False)


def index(request):
    query = request.GET.get('q', '')
    if not query:
        return render(request, "encyclopedia/index.html", {
            "search": False,
            "entries": util.list_entries(),
        })
    elif util.get_entry(query) is not None:
        return HttpResponseRedirect(reverse("encyclopedia:wiki", kwargs={'title': query}))
    else:
        entries_list = []
        for entry in util.list_entries():
            if query.lower() in entry.lower():
                entries_list.append(entry)
        return render(request, "encyclopedia/index.html", {
            "search": True,
            "title": query,
            "entries": entries_list,
        })


def wiki(request, title):
    if title == "random":
        random_entry = random.choice([i for i in util.list_entries()])
        entry = util.get_entry(random_entry)
        return render(request, "encyclopedia/wiki.html", {
            "has_entry": True,
            "title": random_entry,
            "content": markdown2.Markdown().convert(entry),
        })
    entry = util.get_entry(title)
    if entry is None:
        return render(request, "encyclopedia/wiki.html", {
            "has_entry": False,
            "content": "No such entry available.",
        })
    else:
        return render(request, "encyclopedia/wiki.html", {
            "has_entry": True,
            "title": title,
            "content": markdown2.Markdown().convert(entry),
        })


def create(request):
    if request.method == "POST":
        form = CreateNewEntry(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            content = form.cleaned_data["content"]
            if util.get_entry(title) is None or form.cleaned_data["edit"] is True:
                util.save_entry(title, content)
                return HttpResponseRedirect(reverse("encyclopedia:wiki", kwargs={'title': title}))
            else:
                return render(request, "encyclopedia/create.html", {
                    "form": form,
                    "exist": True,
                    "title": title
                })
        else:
            return render(request, "encyclopedia/create.html", {
                "form": form,
                "exist": False
            })
    else:
        return render(request, "encyclopedia/create.html", {
            "form": CreateNewEntry(),
            "existing": False
        })


def edit(request, title):
    form = CreateNewEntry()
    form.fields["title"].initial = title
    form.fields["title"].widget = forms.HiddenInput()
    form.fields["content"].initial = util.get_entry(title)
    form.fields["edit"].initial = True
    return render(request, "encyclopedia/create.html", {
        "form": form,
        "edit": form.fields["edit"].initial,
        "title": form.fields["title"].initial
    })
