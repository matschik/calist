<script lang="ts">
    import { PersistedState } from "runed";

    const userWeight = new PersistedState("userWeight", 80);
</script>

<input name="userWeight" bind:value={userWeight.current}  />

<p>{userWeight.current * 1.2} grammes de protéines minimum par jour</p>
<p>{userWeight.current * 2} grammes de protéines maximum par jour</p>
<p>maximum sinon le foie va transformer les protéines en sucre et donc gras et ça fatigue les reins</p>

Protéines de qualité
- Oeuf
- Produits laitiers fermentés (skyr, fromage blanc, petits suisses, yaourt grec, fromage pate cuite)
- Viandes rouges / blanches / noires
- Poissons et fruits de mer

Combiné à: 
- Légumineuses
- Céréales complètes

Glucides:
- Blé complet à fond (pates, riz)
- Féculents (pommes de terre, patate douce, magnoc)

Légumes:
- fibres

Gras:
Oméga 3: huile noix colza lin chanvre, poisson/fruits mer, fruits secs oléagineux, graines lin chia sésame 
1) Poissons gras: sardine maquereau, thon, truite, saumon, anchois
2) Fruits à coque
3) Bonnes huiles
4) Avocat

Zinc
Pour favoriser de créer des cellules
1) Viandes rouges blanches
2) Produits mer
3) Légumineuses
4) Fruits coques / graines

Calcium:
Vitamine D et du soleil
1) Poissons gras et mollusques
2) Champignons
3) Jaune d'oeuf
4) Chocolat
5) Produits laitiers (fromage pate cuite)

EAU
1,5L à 2L par jour max