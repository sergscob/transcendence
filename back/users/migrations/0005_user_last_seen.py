from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0004_alter_user_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='last_seen',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
