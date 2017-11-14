<?php

$to = 'info@ffstudio.ru'; //Почта получателя, через запятую можно указать сколько угодно адресов
$subject = 'Персональная консультация по стратегиям'; //Загаловок сообщения
$message = '
                <html>
                    <head>
                        <title>' . $subject . '</title>
                    </head>
                    <body>
                        <p>Имя: ' . $_POST['name'] . '</p>
                        <p>Телефон: ' . $_POST['phone'] . '</p>                        
                    </body>
                </html>'; //Текст нашего сообщения можно использовать HTML теги
$headers = "Content-type: text/html; charset=utf-8 \r\n"; //Кодировка письма
$headers .= "From: Отправитель <from@example.com>\r\n"; //Наименование и почта отправителя
mail($to, $subject, $message, $headers); //Отправка письма с помощью функции mail
