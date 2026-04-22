from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('match', '0003_alter_matchplayer_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('code', models.CharField(max_length=64)),
                ('level', models.PositiveIntegerField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddIndex(
            model_name='achievement',
            index=models.Index(fields=['user'], name='match_achieve_user_id_9f0a2a_idx'),
        ),
        migrations.AddIndex(
            model_name='achievement',
            index=models.Index(fields=['created_at'], name='match_achieve_created_4f6d1d_idx'),
        ),
        migrations.AddIndex(
            model_name='achievement',
            index=models.Index(fields=['code'], name='match_achieve_code_b5f227_idx'),
        ),
    ]