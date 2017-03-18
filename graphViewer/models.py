from django.db import models
from django.utils import timezone
from jsonfield import JSONField



class GraphRepo(models.Model):
	key = models.AutoField(primary_key=True)
	name = models.CharField(max_length=200)
	created_date = models.DateTimeField(default=timezone.now)
	graphJSON = JSONField()



