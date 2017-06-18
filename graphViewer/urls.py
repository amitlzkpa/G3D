
from django.conf.urls import url
from . import views




urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^wikiSearchMirror/$', views.wikiSearchMirror, name='wikiSearchMirror'),
    url(r'^wikiGraphData/$', views.wikiGraphData, name='wikiGraphData'),
]