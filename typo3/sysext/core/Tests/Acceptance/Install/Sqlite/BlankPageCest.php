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

namespace TYPO3\CMS\Core\Tests\Acceptance\Install\Sqlite;

use TYPO3\CMS\Core\Tests\Acceptance\Support\InstallTester;

/**
 * Click through installer, go to backend, check blank site in FE works
 */
class BlankPageCest
{
    /**
     * @param InstallTester $I
     * @env sqlite
     */
    public function installTypo3OnSqlite(InstallTester $I)
    {
        // Calling frontend redirects to installer
        $I->amOnPage('/');

        // EnvironmentAndFolders step
        $I->waitForText('Installing TYPO3');
        $I->waitForText('No problems detected, continue with installation');
        $I->click('No problems detected, continue with installation');

        // DatabaseConnection step
        $I->waitForText('Select database', 30);
        $I->selectOption('#t3js-connect-database-driver', 'Manually configured SQLite connection');
        $I->click('Continue');

        // DatabaseData step
        $I->waitForText('Create Administrative User & Specify Site Name');
        $I->fillField('#username', 'admin');
        $I->fillField('#password', 'password');
        $I->click('Continue');

        // DefaultConfiguration step - load distributions
        $I->waitForText('Installation Complete', 30);
        $I->click('#create-site');
        $I->click('Open the TYPO3 Backend');

        // Verify backend login successful
        $I->waitForElement('#t3-username', 30);
        $I->fillField('#t3-username', 'admin');
        $I->fillField('#t3-password', 'password');
        $I->click('#t3-login-submit-section > button');
        $I->waitForElement('.modulemenu', 30);
        $I->waitForElement('.scaffold-content iframe', 30);
        $I->seeCookie('be_typo_user');

        // Verify default frontend is rendered
        $I->amOnPage('/');
        $I->waitForText('Welcome to a default website made with TYPO3');
    }
}
