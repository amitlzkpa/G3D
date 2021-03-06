# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-03-18 20:24
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
import jsonfield.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GraphRepo',
            fields=[
                ('key', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('created_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('graphJSON', jsonfield.fields.JSONField()),
            ],
        ),
    ]
