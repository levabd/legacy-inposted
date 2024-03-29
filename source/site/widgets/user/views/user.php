<?php
/** @var $this \site\widgets\user\User */
/** @var $user \site\models\User */
?>

<div class="well mini_post_white">
    <div class="well yellow">
        <a href="<?= Yii()->createProfileUrl($user) ?>" class="ref_main">
            <b><?= $user->firstName ?></b>
        </a>
    </div>
    <br/>

    <div class="row-fluid">
        <div class="span5">
            <div class="avat">
                <a href="<?= Yii()->createProfileUrl($user) ?>">
                    <img alt="<?= $user->nickname ?>" src="<?= $user->getAvatarUrl(56) ?>" title="<?=$user->nickname?>" align="middle">
                </a>
            </div>
        </div>
        <div class="span7">
            Репутация: <?= $user->reputation ?><br>
            Уровень: <?= $user->level ?><br>
            <?php if ($user->country): ?>
                <img
                    class="country"
                    alt="<?= $user->country ?>"
                    src="<?= $user->country->flagUrl ?>"
                    title="<?= $user->country->name ?>"
                    style="width: 48px;"
                    ><br>
            <?php endif;#($user->country)?>
        </div>
    </div>
</div>