<?php
include "./database.php";
header("Content-Type: application/json");
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}



function GenerateToken($id, $db)
{
    $date = date("Y-m-d H:i:s");
    $min = intval(explode(":", explode(" ", $date)[1])[1]) + 5;
    $h = intval(explode(":", explode(" ", $date)[1])[0]);
    if ($min < 10) {
        $min = "0" . $min;
    }
    if ($min > 60) {
        $min = "00";
        $h = $h + 1;
    }
    if ($h < 10) {
        $h = "0" . $h;
    }

    $expire = date("Y-m-d") . " " . $h . ":" . $min . ":" . date("s");
    return [$db->generateToken($expire, ["id" => $id], ""), $expire];
}

function GET_OPTIONS($req)
{
    $Response = ["error" => true, "message" => []];
    $db = new DATABASE("mysql:host=localhost;dbname=ougly", "root", "");
    if (isset($req['desc'])) {
        $Response = ["error" => false, "message" => $db->getUserinfoByName($req["desc"])];
        return json_encode($Response);
    } else if (isset($req["searchUser"])) {
        $users = [];
        $res = $db->searchUser($req["searchUser"], 10000);
        foreach ($res as $user) {
            array_push($users, $user["fname"]);
        }
        $Response = ["error" => false, "message" => $users];
        return json_encode($Response);
    } else if (isset($req["userInfos"])) {
        $Response = ["error" => false, "message" => [
            "fname" => $req["userInfos"],
            "admin" => false,
            "connexion" => 0,
            "description" => "",
            "image" => "",
            "isset" => $db->issetUser($req["userInfos"])
        ]];
        $id = intval($db->getUserIdByName($req["userInfos"]));
        $infos = $db->getUserinfo($id);
        $co = $db->getUserConnexion($id);
        $arr = [];
        foreach ($co as $c) {
            array_push($arr, $c["id"]);
        }
        $co = $arr;
        $Response["message"]["connexion"] = count($co);
        $Response["message"]["admin"] = $db->isAdminById($id);
        if (!empty($infos)) {
            $Response["message"]["description"] = $infos["description"];
            $Response["message"]["image"] = $infos["profile_image"];
        }
        return json_encode($Response);
    } else if (isset($req["connexion"])) {
        $Response = ["error" => false, "message" => []];
        $id = intval($db->getUserIdByName($req["connexion"]));
        $co = $db->getUserConnexion($id);
        $arr = [];
        foreach ($co as $c) {
            array_push($arr, ["id" => $c["id"], "date" => $c["date"], "name" => $req["connexion"]]);
        }
        $Response["message"] = $arr;
        return json_encode($Response);
    } else if (isset($req["searchPost"])) {
        $db->removePostNotToday();
        $res = $db->SearchPost($req["searchPost"], 200);
        $names = [];
        foreach ($res as $it) {
            array_push($names, $it["title"]);
        }
        $Response = ["error" => false, "message" => $names];
        return json_encode($Response);
    } else if (isset($req["posts"])) {
        $db->removePostNotToday();
        $res = $db->getPostByTitle($req["posts"]);
        $data = [];
        foreach ($res as $it) {
            array_push($data, ["title" => $it["title"], "content" => $it["content"], "author" => $it["author"], "date" => $it["date"]]);
        }
        $Response = ["error" => false, "message" => $data];
        return json_encode($Response);
    }
    return json_encode($Response);
}

function GetNameByToken(string $token)
{
    return json_decode(base64_decode(explode(".", $token)[1]))->id;
}

function POST_OPTIONS($req)
{
    $db = new DATABASE("mysql:host=localhost;dbname=ougly", "root", "");
    $Response = ["error" => true, "message" => []];

    if (isset($req->password) && isset($req->username)) {
        $Response = [
            "error" => false,
            "message" => [
                "valide" => false,
                "profile" => [],
                "token" => "",
                "expire" => ""
            ],
        ];
        if ($db->login($req->username, $req->password)) {
            $Response["message"]["valide"] = true;
            $Response["message"]["profile"] = $db->getUserByLogin($req->username, $req->password);
            $db->insertConnexion(intval($Response["message"]["profile"]["id"]));
            $tk = GenerateToken($Response["message"]["profile"]["fname"], $db);
            $Response["message"]["token"] = $tk[0];
            $Response["message"]["expire"] = $tk[1];
            return json_encode($Response);
        }
    }else if(isset($req->name) && isset($req->pass) && isset($req->reg)){
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->insertUser($req->name,$req->pass,0,date("Y-m-d H:i:s"),0),
            ]
        ];
        return json_encode($Response);
    } 
    else if (isset($req->token) && isset($req->username)) {
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->isValideToken($req->token),
                "id" => $db->getUserIdByName($req->username)
            ]
        ];
        return json_encode($Response);
    } else if (isset($req->name) && isset($req->id)) {
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->issetUserIDName($req->name, intval($req->id)),
                "id" => intval($req->id),
                "name" => $req->name
            ]
        ];
        return json_encode($Response);
    } else if (isset($req->fname) && isset($req->password)) {
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->insertUser($req->fname, $req->password, 0, date("Y-m-d H:i:s"), 0),
            ]
        ];
        return json_encode($Response);
    } else if (isset($req->description) && isset($req->image) && isset($req->id)) {
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->updateUserinfo(intval($req->id), $req->image, $req->description),
            ]
        ];
        return json_encode($Response);
    } else if (isset($req->id) && isset($req->post) && isset($req->title)) {
        $id = intval($req->id);
        $title = $req->title;
        $content = $req->post;
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->insertPost($title, $content, $id, []),
            ]
        ];
        return json_encode($Response);
    }else if(isset($req->id) && isset($req->newpassword)){
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->updateUserPassword(intval($req->id),$req->newpassword)
            ]
        ];
        return json_encode($Response);
    }else if(isset($req->id) && isset($req->remove)){
        $Response = [
            "error" => false,
            "message" => [
                "valide" => $db->deleteUser(intval($req->id))
            ]
        ];
        return json_encode($Response);
    }
    else {
        return json_encode($Response);
    }
}


$POST = file_get_contents('php://input');
if (isset($POST) && !empty($POST)) {
    $req = json_decode($POST);
    echo POST_OPTIONS($req);
} else if (isset($_GET) && !empty($_GET)) {
    echo GET_OPTIONS($_GET);
}
