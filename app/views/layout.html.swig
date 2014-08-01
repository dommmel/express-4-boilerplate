<!doctype html>
<html>
<head>
  {{ stylesheet('application.css') }}    
</head>
<body>
  {% block content %}{% endblock %}
  {{ javascript('application.js') }}
</body>
</html>