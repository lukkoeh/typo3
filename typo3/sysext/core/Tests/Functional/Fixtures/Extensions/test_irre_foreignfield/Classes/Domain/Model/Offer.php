<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\TestIrreForeignfield\Domain\Model;

use TYPO3\CMS\Extbase\Annotation as Extbase;
use TYPO3\CMS\Extbase\DomainObject\AbstractEntity;
use TYPO3\CMS\Extbase\Persistence\ObjectStorage;

/**
 * Offer
 */
class Offer extends AbstractEntity
{
    /**
     * @var string
     */
    protected $title = '';

    /**
     * @Extbase\ORM\Lazy
     * @var \TYPO3\CMS\Extbase\Persistence\ObjectStorage<\TYPO3\TestIrreForeignfield\Domain\Model\Offer>
     */
    protected $prices;

    /**
     * Initializes this object.
     */
    public function __construct()
    {
        $this->prices = new ObjectStorage();
    }

    /**
     * @return string $title
     */
    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle($title): void
    {
        $this->title = $title;
    }

    public function getPrices(): ObjectStorage
    {
        return $this->prices;
    }

    public function setPrices(ObjectStorage $prices): void
    {
        $this->prices = $prices;
    }
}
