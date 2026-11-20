@props(['url'])
{{-- Logo he4rt ink em PNG (clientes de e-mail não exibem SVG), gerado por design/logo/gerar.mjs --}}
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ asset('images/email/logo.png') }}" width="172" height="36" alt="{{ config('app.name') }}" style="border: 0; display: block; height: 36px; width: 172px;">
</a>
</td>
</tr>
