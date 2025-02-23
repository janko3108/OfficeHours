from django import template
from datetime import timedelta

register = template.Library()

@register.filter
def add_hours(value, hours):
    try:
        return value + timedelta(hours=int(hours))
    except Exception:
        return value

@register.filter
def combine_key(day, hour):
    try:
        return f"{day.strftime('%Y-%m-%d')}|{hour}"
    except Exception:
        return ''

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)
