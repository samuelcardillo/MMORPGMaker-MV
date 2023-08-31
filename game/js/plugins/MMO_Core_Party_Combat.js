//=============================================================================
// MMO_Core_Party_Combat.js
//=============================================================================

/*:
 * @plugindesc MMORPG Maker MV - Core Handling Combat in Party
 * @author Samuel LESPES CARDILLO
 *
 * @help This plugin does not provide plugin commands.
 */

function MMO_Core_Party_Combat() {
  this.initialize.apply(this, arguments);
}

(function () {
  MMO_Core_Party_Combat.startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
  Scene_Battle.prototype.startActorCommandSelection = function () {
    // If it is a party battle and the player selected an action
    if ($gameParty.size() > 1 && BattleManager.actor().index() > 0) {

      if (MMO_Core_Player.isCombatInitiator) BattleManager._canEscape = true; // If combat initiator, we can escape the combat.

      BattleManager._actorIndex = 0; // We make sure he can't control the others
      let action = BattleManager.actor()._actions[0]; // We store its action
      MMO_Core.socket.emit("party_player_action_fight", action); // We send the action to the server
      BattleManager.startInput();
      return;
    }

    MMO_Core_Party_Combat.startActorCommandSelection.call(this);
  }

  
  // [WORK AROUND] Work around RPG Maker MV engine not understanding party changes at beginning of combat  
  MMO_Core_Party_Combat.updateStatusWindow = Scene_Battle.prototype.updateStatusWindow;
  Scene_Battle.prototype.updateStatusWindow = function() {

    if (this.isActive() && !this._messageWindow.isClosing()) {
      if(MMO_Core_Party.Party.length > 0) {
        for(var i = 0; i < SceneManager._scene._spriteset.children[0].children[2].children.length; i++) { 
          if(!(SceneManager._scene._spriteset.children[0].children[2].children[i] instanceof Sprite_Actor)) continue;
          if(SceneManager._scene._spriteset.children[0].children[2].children[i]._actor) continue;
          SceneManager._scene._spriteset.children[0].children[2].children[i].moveToStartPosition();
        }
      }
    }

    MMO_Core_Party_Combat.updateStatusWindow.call(this);
  };

  // Create an estimation of damages for combat synchronisation
  Game_Action.prototype.estimateDamages = async function (target) {
    var targetResult = target.result();
    var result = {};

    this.subject().clearResult();
    targetResult.clear();

    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.used && !result.missed && !result.evaded) {
      if (this.item().damage.type > 0) {
        result.critical = (Math.random() < this.itemCri(target));
        var value = this.makeDamageValue(target, result.critical);
        if (value === 0) result.critical = false;
        if (this.isHpEffect()) {
          if (this.isDrain()) value = Math.min(target.hp, value);
          result.hpDamage = -value;
        }
        if (this.isMpEffect()) {
          if (!this.isMpRecover()) value = Math.min(target.mp, value);
          result.mpDamage = -value;
        }
      }
      this.item().effects.forEach(function (effect) {
        this.applyItemEffect(target, effect);
      }, this);
      this.applyItemUserEffect(target);
    }
    return result;
  };

  // Apply preset damages to the target
  Game_Action.prototype.applyPresetDamages = function (target, presetDamages) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = presetDamages.used;
    result.missed = presetDamages.missed;
    result.evaded = presetDamages.evaded;
    result.physical = presetDamages.physical;
    result.drain = presetDamages.drain;
    if (result.isHit()) {
      if (this.item().damage.type > 0) {
        result.critical = presetDamages.critical;

        if (presetDamages.hpDamage) {
          presetDamages.hpDamage = -presetDamages.hpDamage;
          if (this.isDrain()) {
            presetDamages.hpDamage = Math.min(target.hp, presetDamages.hpDamage);
          }
          this.makeSuccess(target);
          target.gainHp(-presetDamages.hpDamage);
          if (presetDamages.hpDamage > 0) {
            target.onDamage(presetDamages.hpDamage);
          }
          this.gainDrainedHp(presetDamages.hpDamage);
        }
        if (presetDamages.mpDamage) {
          presetDamages.mpDamage = -presetDamages.mpDamage;
          if (!this.isMpRecover()) {
            presetDamages.mpDamage = Math.min(target.mp, presetDamages.mpDamage);
          }
          if (presetDamages.mpDamage !== 0) this.makeSuccess();
          target.gainMp(-presetDamages.mpDamage);
          this.gainDrainedMp(presetDamages.mpDamage);
        }
      }
      this.item().effects.forEach(function (effect) {
        this.applyItemEffect(target, effect);
      }, this);
      this.applyItemUserEffect(target);
    }
  };

  MMO_Core_Party_Combat.onBattleStart = Game_Unit.prototype.onBattleStart;
  Game_Unit.prototype.onBattleStart = function () {
    if (this instanceof Game_Party && $gameParty.size() > 1) {
      console.log("teijr")
      MMO_Core.socket.emit("party_player_join_fight", $gameTroop);
    }
    MMO_Core_Party_Combat.onBattleStart.call(this);
  };

  MMO_Core_Party_Combat.onBattleEnd = Game_Unit.prototype.onBattleEnd;
  Game_Unit.prototype.onBattleEnd = function () {
    if (this instanceof Game_Party && $gameParty.size() > 1) MMO_Core.socket.emit("party_player_end_fight");
    MMO_Core_Party_Combat.onBattleEnd.call(this);
  };

  // We don't let other people leave the fight until the initiator does
  MMO_Core_Party_Combat.endBattle = BattleManager.endBattle;
  BattleManager.endBattle = function (result) {
    if ($gameParty.size() > 1 && !MMO_Core_Player.isCombatInitiator) return; // We block it.

    MMO_Core_Party_Combat.endBattle.call(this, result);
  }

  // Received when another party member start a fight on the same map
  MMO_Core.socket.on("party_player_join_fight", function (payload) {
    if ($gameParty._inBattle || !payload || !payload._troopId) return;

    BattleManager.setup(payload._troopId, false, true);

    for (var i = 0; i < $gameTroop._enemies.length; i++) {
      $gameTroop._enemies[i]._hp = payload._enemies[i]._hp;
      $gameTroop._enemies[i]._mp = payload._enemies[i]._mp;
    }

    MMO_Core_Player.Player.isInCombat = true;

    SceneManager.goto(Scene_Battle);
  })

  MMO_Core.socket.on("party_player_estimate_fight", async function (actions) {
    let battleMembers = BattleManager.allBattleMembers();
    let results = {};

    // We go through every battle members to classify them.
    for (var i = 0; i < battleMembers.length; i++) {
      if (battleMembers[i]._actions[0] === undefined) { i++; continue; }

      // If Game Actor then we set up the actions.
      if (battleMembers[i] instanceof Game_Actor) {
        let action = actions[battleMembers[i]._name]; // We assign the action corresponding to the player
        battleMembers[i]._actions[0]._targetIndex = action._targetIndex;
        battleMembers[i]._actions[0]._item._dataClass = action._item._dataClass;
        battleMembers[i]._actions[0]._item._itemId = action._item._itemId;
      }

      // If Game Enemy then we leave the game logic apply itself.
      if (battleMembers[i] instanceof Game_Enemy) {
        battleMembers[i]._actions[0].decideRandomTarget()
      }

      // Then we gather the targets and make a list out of it.
      let actorName = battleMembers[i].name();
      let targets = battleMembers[i]._actions[0].makeTargets();
      results[actorName] = {};
      results[actorName].targets = {}

      // We store the action so we also know what the NPCs did.
      results[actorName].action = battleMembers[i]._actions[0];

      for (var k in targets) {
        let targetName = targets[k].name();
        results[actorName].targets[targetName] = await battleMembers[i]._actions[0].estimateDamages(targets[k]);
      }
    }

    MMO_Core.socket.emit("party_player_estimate_fight", results);
  })


  // Received when all party members have done their actions
  MMO_Core.socket.on("party_player_action_fight", async function (results) {
    let battleMembers = BattleManager.allBattleMembers();
    let actors = {};

    // We classify the actors by name
    for (var i = 0; i < battleMembers.length; i++) {
      actors[battleMembers[i].name()] = battleMembers[i];
    }

    // We  then go through each actors to do their turns
    for (var actorName in actors) {
      let result = results[actorName];
      let currentActor = actors[actorName];

      // If an action is defined, we set it
      if (currentActor._actions[0]) {
        currentActor._actions[0]._item._dataClass = result.action._item._dataClass;
        currentActor._actions[0]._item._itemId = result.action._item._itemId;
      }

      // We set the targets with the appropriate actor in a Array
      currentActor.realTargets = [];
      if (result) {
        for (var targetName in result.targets) {
          currentActor.realTargets.push(actors[targetName]);
        }
      }


      // Turn start
      BattleManager.startTurn();
      BattleManager._subject = currentActor; // The actor becomes the subject
      // BattleManager.processTurn(); // Do the action checking

      // processTurn()
      var action = currentActor.currentAction();
      if (action) {
        action.prepare();
        if (action.isValid()) {
          // startAction()
          BattleManager._phase = 'partyAction';
          BattleManager._targets = currentActor.realTargets;
          BattleManager._action = action;
          currentActor.useItem(action.item());
          BattleManager._action.applyGlobal();
          BattleManager.refreshStatus();
          BattleManager._logWindow.startAction(currentActor, action, currentActor.realTargets);

          // updateAction()
          for (var k in BattleManager._targets) {
            var currentTarget = BattleManager._targets.shift();
            if (currentTarget) {
              // invokeAction()
              if (Math.random() < BattleManager._action.itemCnt(currentTarget)) {
                // Counter Attack
                var action = new Game_Action(currentTarget);
                action.setAttack();
                action.applyPresetDamages(currentActor, results[currentTarget.name()].targets[currentActor.name()])
                BattleManager._logWindow.displayCounter(currentTarget);
                BattleManager._logWindow.displayActionResults(currentTarget, currentActor);
              } else if (Math.random() < BattleManager._action.itemMrf(currentTarget)) {
                // Magic Reflection
                BattleManager._action._reflectionTarget = currentTarget;
                BattleManager._logWindow.displayReflection(currentTarget);
                action.applyPresetDamages(currentActor, results[currentTarget.name()].targets[currentActor.name()])

                BattleManager._logWindow.displayActionResults(currentTarget, currentActor);
              } else {
                // Normal Attack
                var realTarget = BattleManager.applySubstitute(currentTarget);
                BattleManager._action.apply(realTarget);
                action.applyPresetDamages(realTarget, result.targets[realTarget.name()]);
                currentActor._hidden = (currentActor.hp === 0) ? true : false;
                BattleManager._logWindow.displayActionResults(currentActor, realTarget);
              }
              currentActor.setLastTarget(currentTarget); // Will probably to rewrite
              BattleManager._logWindow.push('popBaseLine');
              BattleManager.refreshStatus();
            } else {
              BattleManager.endAction();
              BattleManager.startInput();
              BattleManager.selectNextCommand();
            }
          }

          // updateAction()

        }
        currentActor.removeCurrentAction();
      } else {
        currentActor.onAllActionsEnd();
        BattleManager.refreshStatus();
        BattleManager._logWindow.displayAutoAffectedStatus(currentActor);
        BattleManager._logWindow.displayCurrentState(currentActor);
        BattleManager._logWindow.displayRegeneration(currentActor);
        BattleManager._subject = BattleManager.getNextSubject();
      }

      // We end the action (and turn)
      BattleManager.endAction();
    }
  })

  MMO_Core.socket.on("party_player_disband_fight", function (payload) {
    if (SceneManager._nextScene !== null) return;
    if (!$gameParty._inBattle) return;

    SceneManager.goto(Scene_Map);
  })

})();