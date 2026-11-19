<?php

test('a página inicial responde com sucesso', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});
