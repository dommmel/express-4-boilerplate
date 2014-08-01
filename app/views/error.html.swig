{% extends 'layout.html.swig' %}
{% block content %}

<h1>{{message}}</h1>
<h3>{{status}}</h3>
<pre> {{error.stack}}</pre>

{% endblock %}
