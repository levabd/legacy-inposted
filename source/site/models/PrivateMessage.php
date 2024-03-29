<?php
/**
 * @author Yura Fedoriv <yurko.fedoriv@gmail.com>
 */

namespace site\models;


use base\ActiveRecord;

class PrivateMessage extends ActiveRecord
{
    public $id;
    public $date;
    public $topic;
    public $body;

    public function rules() {
        return [
            ['body, User_id_from, User_id_to', 'required','message'=>'Введите {attribute}'],
        ];
    }

    public function relations() {
        return [
            'from' => [self::BELONGS_TO, $this->ns('User'), 'User_id_from'],
            'to'   => [self::BELONGS_TO, $this->ns('User'), 'User_id_to'],
        ];
    }

    protected function beforeValidate() {
        $this->setAttribute('User_id_from', Yii()->user->id);
        return parent::beforeValidate();
    }


    protected function beforeSave() {
        if ($this->isNewRecord) {
            $this->date = new \CDbExpression('UTC_TIMESTAMP()');
        }
        $this->body = \CHtml::encode($this->body);
        return parent::beforeSave();
    }

    public function getRestAttributes() {
        return [
            'id'     => $this->id,
            'date'   => gmdate('c', strtotime($this->date . ' UTC')),
            'topic'  => $this->topic,
            'body'   => $this->body,
            'errors' => array_filter(
                [
                'topic' => $this->getError('topic'),
                'body'  => $this->getError('body'),
                ]
            ),
            'from'   => $this->from->restAttributes,
        ];
    }

    protected function afterSave() {
        parent::afterSave(); // TODO: Change the autogenerated stub
        $this->refresh();
    }


}