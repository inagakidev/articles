<?php

test('homepage redirects to the articles list', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('articles.index'));
});
