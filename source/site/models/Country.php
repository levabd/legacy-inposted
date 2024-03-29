<?php
/**
 * @author Yura Fedoriv <yurko.fedoriv@gmail.com>
 */
namespace site\models;
class Country extends \shared\models\Country
{
    public function scopes() {
        return [
            'sort' => [
                'order'  => "FIELD(`code`, :country) DESC, name",
                'params' => ['country' => Yii()->geoip->clientCountryCode]
            ]
        ];
    }

    public function listData() {
        $this->getByGeoip();
        return \CHtml::listData($this->sort()->findAll(), 'id', 'name');
    }

    public function getByGeoip(){
        $geoIp = Yii()->geoip;

        $country = null;

        if ($code = $geoIp->clientCountryCode) {
            if (!($country = $this->findByAttributes(['code' => $code]))) {
                if ($name = $geoIp->clientCountryName) {
                    $country = new self;
                    $country->code = $code;
                    $country->name = $name;
                    $country->save();
                }
            }
        }

        return $country;
    }

    public function getRestAttributes(){
        return $this->attributes;
    }
}
