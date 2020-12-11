<?php
class DATABASE
{

    /**
     * Method
     */
    private $db;
    public function __construct(string $pdo, string $username, string $pass)
    {
        $this->db = new PDO($pdo, $username, $pass);
    }
    private function execSql(string $sql, array $data = [])
    {
        $exec = $this->db->prepare($sql);
        $exec->execute($data);
        return $exec;
    }

    /**
     * Login info
     */
    public function login(string $user, string $pass): bool
    {
        $f = $this->execSql("SELECT * FROM `users` WHERE fname=:n AND password=:p", [":n" => $user, ":p" => $pass]);
        if (!empty($f->fetch())) {
            return true;
        } else {
            return false;
        }
    }
    public function isAdmin(string $user, string $pass): bool
    {
        try {
            if ($this->execSql("SELECT * FROM `users` WHERE  fname=:n AND password=:p", [":n" => $user, ":p" => $pass])->fetch()["admin"] == 1) {
                return true;
            } else {
                return false;
            }
        } catch (Error $e) {
            return false;
        }
    }
    public function isAdminById(int $user_id)
    {
        try {
            if ($this->execSql("SELECT * FROM `users` WHERE  id=?", [$user_id])->fetch()["admin"] == 1) {
                return true;
            } else {
                return false;
            }
        } catch (Error $e) {
            return false;
        }
    }
    public function isExpire(int $id): bool
    {
        $arr = $this->getOneUser($id);
        $date_now = new DateTime();
        if (intval($arr["expire"]) == 1 && $date_now >= new DateTime($arr["dateEx"])) {
            $this->execSql("UPDATE `users` SET expire=0, isBlock=1 WHERE id=?", [$id]);
            return true;
        } else {
            return false;
        }
    }
    public function getUserByLogin(string $name, string $pass)
    {
        return $this->execSql("SELECT * FROM `users` WHERE fname=? AND password=?", [$name, $pass])->fetch();
    }

    /**
     * Block
     */
    public function SetAdmin(int $id)
    {
        if ($this->execSql("UPDATE FROM `users` SET admin=? WHERE id=?", [1, $id])) {
            return true;
        }
        return false;
    }
    public function SetExpire(int $id, string $date): bool
    {
        if ($this->execSql("UPDATE `users` SET expire=1, dateEx=\"" . $date . "\" WHERE id=?", [$id])) {
            $this->execSql("UPDATE  `users` SET isBlock=0 WHERE id=?", [$id]);
            return true;
        }
        return false;
    }
    public function isBlock(int $id): bool
    {
        if ($this->getOneUser($id)["isBlock"] == "1") {
            return true;
        } else {
            return false;
        }
    }
    public function BlockUser(int $b, int $id): bool
    {
        if ($b !== 1 && $b !== 0) {
            $b = 0;
        }
        if ($b == 1) {
            $this->execSql("UPDATE `users` SET expire=0 WHERE id=?", [$id]);
        }
        if ($this->execSql("UPDATE `users` SET isBlock=? WHERE id=?", [$b, $id])) {
            return true;
        } else {
            return false;
        };
    }


    /**
     * Connexion
     */
    public function insertConnexion(int $id): bool
    {
        if ($this->execSql("INSERT INTO `connexion`(user_id,date) VALUES(?,NOW()) ", [$id])) {
            return true;
        } else {
            return false;
        }
    }
    public function getLastConnexion()
    {
        if (intval($this->execSql("SELECT COUNT(*) FROM connexion", [])->fetch()) > 100) {
            $this->execSql("DELETE FROM connexion ORDER BY id LIMIT 50", []);
        }
        $arr = $this->execSql("SELECT * FROM connexion ORDER BY date LIMIT 30", [])->fetchAll();
        return $arr;
    }
    public function getUserConnexion(int $user_id): array
    {
        return $this->execSql("SELECT * FROM `connexion` WHERE user_id=?", [$user_id])->fetchAll();
    }

    /**
     * User
     */
    public function issetUser(string $fname): bool
    {
        if ($this->execSql("SELECT * FROM `users` WHERE fname=?", [$fname])->fetch()) {
            return true;
        } else {
            return false;
        }
    }
    public function getUserIdByName(string $fname): int
    {
        $res = $this->execSql("SELECT * FROM `users` WHERE fname=?", [$fname])->fetch();
        if (!empty($res)) {
            return intval($res["id"]);
        }
        return 0;
    }
    public function updateUserPassword(int $id, string $password): bool
    {
        if ($this->execSql("UPDATE `users` SET password=? WHERE id=?", [$password, $id])) {
            return true;
        }
        return false;
    }
    public function updateUserName(int $id, string $name)
    {
        if (empty($this->execSql("SELECT * FROM `users` WHERE fname=?", [$name])->fetch())) {
            if ($this->execSql("UPDATE FROM `users` SET fname=? WHERE id=?", [$name, $id])) {
                return true;
            }
        }
        return false;
    }
    public function GetUserById(string $id)
    {
        return $this->execSql("SELECT *  FROM`user` WHERE id=?", [$id])->fetch();
    }
    public function issetUserIDName(string $fname, int $id): bool
    {
        if (!empty($this->execSql("SELECT * FROM `user` WHERE fname=? AND id=?", [$fname, $id])->fetch())) {
            return true;
        } else {
            return false;
        }
    }
    public function deleteUser(int $id): bool
    {
        if ($this->execSql("DELETE FROM `users` WHERE id=?", [$id])) {
            $this->execSql("DELETE FROM  `connexion` WHERE user_id=?", [$id]);
            $this->execSql("DELETE FROM `userinfo` WHERE user_id=?",[$id]);
            $this->execSql("DELETE FROM `post` WHERE user_id=?",[$id]);
            return true;
        } else {
            return false;
        };
    }
    public function insertUser(string $name, string $pass, int $ex, string $date, int $b): bool
    {
        if ($ex !== 1 && $ex !== 0) {
            $ex = 0;
        }
        if ($b !== 1 && $b !== 0) {
            $b = 0;
        }
        if (!$this->issetUser($name)) {
            if ($this->execSql("INSERT INTO `users`(fname,password,expire,dateEx,isBlock) VALUES(:fname,:pass,:ex,:date,:b)", [":fname" => $name, ":pass" => $pass, ":ex" => $ex, ":date" => $date, ":b" => $b])) {
                try {
                    $this->insertUserinfo($this->getUserByLogin($name, $pass)["id"],"","");
                    $this->insertConnexion($this->getUserByLogin($name, $pass)["id"]);
                    return true;
                } catch (\Throwable $th) {
                    return false;
                }
            }
        }
        return false;
    }
    public function getAllUser(): array
    {
        return $this->execSql("SELECT * FROM `users` ORDER BY id DESC LIMIT 20", [])->fetchAll();
    }
    public function searchUser(string $search, int $max): array
    {
        return $this->execSql("SELECT * FROM `users` WHERE fname LIKE \"%" . $search . "%\" LIMIT " . $max . "", [])->fetchAll();
    }
    public function getOneUser(int $id): array
    {
        return $this->execSql("SELECT * FROM `users` WHERE id=?", [$id])->fetch();
    }
    public function getUserame(int $id): string
    {
        $res = $this->execSql("SELECT * FROM `users` WHERE id=?", [$id])->fetch();
        if (!empty($res)) {
            return $res["fname"];
        }
        return "";
    }


    /**
     * Message
     */
    public function InsertMessage(string $text, int $to): bool
    {
        if ($this->execSql("INSERT INTO `message`(date,user_id,content) VALUES(NOW(),:user_id,:content)", [":user_id" => $to, ":content" => $text])) {
            return true;
        } else {
            return false;
        }
    }
    public function GetMessage(int $id): array
    {
        return $this->execSql("SELECT * FROM `message` WHERE user_id=?", [$id])->fetchAll();
    }
    public function DeleteMessage(int $id, int $add): void
    {
        $ex = date("m")  + ":" + (date("d") + $add) + ":" + date("Y");
        $messages = $this->GetMessage($id);
        $ids = [];
        foreach ($messages as $key) {
            if ($key == "date") {
                if ($messages[$key] == $ex) {
                    array_push($id, $messages["id"]);
                }
            }
        }
        foreach ($ids as $id) {
            $this->execSql("DELETE FROM `message` WHERE id=?", [$id]);
        }
    }

    /**
     * Token
     */
    public function generateToken(string $expire, array $data, $key): string
    {
        try {
            $date = new DateTime($expire);
            $now = new DateTime(date("Y-m-d H:i:s"));
            $token = "";

            if ($date < $now) {
                return "";
            } else {
                $GeneratedKey = sha1(microtime(true) . mt_rand(10000, 99999));
                $token = base64_encode($expire) . "." . base64_encode(json_encode($data)) .  "." . base64_encode($GeneratedKey);
                $this->execSql("INSERT INTO `token`(expire,data,generatedKey,token,secretKey) VALUES(?,?,?,?,?)", [$expire, json_encode($data), $GeneratedKey, $token, $key]);
                return $token;
            }
        } catch (Throwable $e) {
            return "";
        }
    }
    public function isValideToken(string $token): bool
    {
        if (count(explode(".", $token)) == 3) {
            try {
                $expire = base64_decode(explode(".", $token)[0]);
                $date = new DateTime($expire);
                $now = new DateTime(date("Y-m-d H:i:s"));
                if ($date < $now) {
                    $this->removeToken($token);
                    $this->removeInvalidToken();
                    return false;
                } else {
                    $res = $this->execSql("SELECT * FROM `token` WHERE token=?", [$token])->fetch();
                    if ($res["token"] == $token) {
                        $this->removeToken($token);
                        return true;
                    } else {
                        $this->removeInvalidToken();
                        return false;
                    }
                }
            } catch (Throwable $e) {
                return false;
            }
        } else {
            return false;
        }
    }
    public function removeToken(string $token): bool
    {
        if ($this->execSql("DELETE FROM `token` WHERE token=?", [$token])) {
            return true;
        } else {
            return false;
        }
    }
    public function removeInvalidToken(): void
    {
        foreach ($this->execSql("SELECT * FROM `token`", []) as $element) {
            $expire = base64_decode(explode(".", $element["token"])[0]);
            try {
                $date = new DateTime($expire);
                $now = new DateTime(date("Y-m-d H:i:s"));
                if ($date < $now) {
                    $this->execSql("DELETE FROM `token` WHERE id=?", [$element["id"]]);
                }
            } catch (Throwable $e) {
            }
        }
    }


    /**
     * User info
     */
    public function insertUserinfo(int $user_id, string $image, string $desc): bool
    {
        if ($this->execSql("INSERT iNTO `userinfo`(user_id,image,description) VALUES(?,?,?)", [$user_id, $image, $desc])) {
            return true;
        } else {
            return false;
        }
    }
    public function removeUserinfo(int $user_id): bool
    {
        if ($this->execSql("DELETE FROM `userinfo` WHERE user_id=?", [$user_id])) {
            return true;
        } else {
            return false;
        }
    }
    public function getUserinfoByName(string $name): array
    {
        $res = $this->execSql("SELECT * FROM `users` WHERE fname=?", [$name])->fetch();
        if (!empty($res)) {
            $inf = $this->getUserinfo(intval($res["id"]));
            if (!empty($inf)) {
                return ["description" => $inf["description"], "image" => $inf["profile_image"]];
            }
        }
        return [];
    }
    public function getUserinfo(int $user_id)
    {
        return $this->execSql("SELECT * FROM `userinfo` WHERE user_id=?", [$user_id])->fetch();
    }
    public function updateUserinfo(int $userid, string $image, string $desc): bool
    {
        if (empty($image) && !empty($desc)) {
            if ($this->execSql("UPDATE `userinfo` SET description=:desP WHERE user_id=:id", [":desP" => $desc, ":id" => $userid])) {
                return true;
            }
        } else if (!empty($image) && empty($desc)) {
            if ($this->execSql("UPDATE `userinfo` SET image=? WHERE user_id=?", [$image, $userid])) {
                return true;
            }
        } else if (!empty($image) && !empty($desc)) {
            if ($this->execSql("UPDATE `userinfo` SET image=?, description=? WHERE user_id=?", [$image, $desc, $userid])) {
                return true;
            }
        }
        return false;
    }
    /**
     * Posts
     */
    public function insertPost(string $title, string $content, int $user_id, array $tag): bool
    {
        $post = [
            $title,
            $content,
            date("Y-m-d h:i:s"),
            0,
            $this->getUserame($user_id),
            $user_id,
            implode(" | ", $tag)
        ];
        return $this->execSql("INSERT INTO `post`(title,content,date,likes,author,author_id,tag) VALUES(?,?,?,?,?,?,?)", $post) ? true : false;
    }
    public function getUserPosts(int $id): array
    {
        $res = $this->execSql("SELECT * FROM `post` WHERE author_id=?", [$id]);
        if (!empty($id)) {
            return $res;
        }
        return [];
    }
    public function getPostByTitle(string $title): array
    {
        return $this->execSql("SELECT * FROM `post` WHERE title=?", [$title])->fetchAll();
    }
    public function removePostNotToday(): void
    {
        $res = $this->execSql("SELECT * FROM `post`")->fetchAll();
        foreach ($res as $it) {
            $date = explode(" ", $it["date"])[0];
            if ($date != date("Y-m-d")) {
                $this->execSql("DELETE FROM `post` WHERE id=?", [$it["id"]]);
            }
        }
    }
    public function SearchPost(string $search, int $max)
    {
        $res = $this->execSql("SELECT * FROM `post` WHERE title LIKE \"%" . $search . "%\" OR content LIKE \"%" . $search . "%\" LIMIT " . $max . "", [])->fetchAll();
        if (!empty($res)) return $res;
        return [];
    }
    public function removePost(int $id): bool
    {
        return $this->execSql("DELETE FROM `post` WHERE id=?", [$id]);
    }
    public function updatePost(int $id, string $title, string $content): bool
    {
        return $this->execSql("UPDATE `post` SET title=?, content=? WHERE id=?", [$title, $content, $id]);
    }
    public function listPost(int $max): array
    {
        $res = $this->execSql("SELECT * FROM `post` LIMIT " . $max . "", []);
        if (!empty($res)) return $res;
        return [];
    }
    public function addLikePost(int $id): bool
    {
        return $this->execSql("UPDATE `post` SET likes=likes+1 WHERE id+?", [$id]);
    }
    public function addTag(int $post, string $value): bool
    {
        $res = $this->execSql("SELECT * FROM `post` WHERE id=?", [$post]);
        if (!empty($res)) {
            $arr = explode(" | ", $res["tag"]);
            array_push($arr, $value);
            $final = implode(" | ", $arr);
            return $this->execSql("UPDATE `post` SET tag=? WHERE id=?", [$final, $post]);
        }
        return false;
    }
    public function removeTag(int $id, string $value)
    {
        $res = $this->execSql("SELECT * FROM `post` WHERE id=?", [$id]);
        if (!empty($res)) {
            $arr = explode(" | ", $res["tag"]);
            $newArr = [];
            foreach ($arr as $it) {
                if ($it != $value) {
                    array_push($newArr, $it);
                }
            }
            $final = implode(" | ", $newArr);
            return $this->execSql("UPDATE `post` SET tag=? WHERE id=?", [$final, $id]);
        }
        return false;
    }


    /**
     * Clearing
     */
    public function clearUsers()
    {
        $this->execSql("TRUNCATE `users` ", []);
    }
    public function clearMessages()
    {
        $this->execSql("TRUNCATE `message` ", []);
    }
    public function clearCo()
    {
        $this->execSql("TRUNCATE `connexion` ", []);
    }
    public function clearUserinfo()
    {
        $this->execSql("TRUNCATE `userinfo` ", []);
    }
    public function clearPost()
    {
        $this->execSql("TRUNCATE `post` ", []);
    }

    public function clear()
    {
        $this->clearPost();
        $this->clearCo();
        $this->clearUsers();
        $this->clearMessages();
        $this->clearUserinfo();
    }
}
