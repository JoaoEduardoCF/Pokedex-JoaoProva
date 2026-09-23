const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const SPECIES_URL = 'https://pokeapi.co/api/v2/pokemon-species/';

let currentPokemonId = 1;

const translateType = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Venenoso',
  ground: 'Terrestre', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', steel: 'Aço', fairy: 'Fada'
};

const translateStat = {
  'hp': 'Vida', 'attack': 'Ataque', 'defense': 'Defesa',
  'special-attack': 'Atq. Especial', 'special-defense': 'Def. Especial', 'speed': 'Velocidade'
};

const searchInput = document.getElementById('pokemon-input');
const searchBtn = document.getElementById('search-btn');
const startGameBtn = document.getElementById('start-game-btn');
const pokeballsWrapper = document.getElementById('pokeballs-wrapper');
const pokeballs = document.querySelectorAll('.pokeball');
const pokemonDisplay = document.getElementById('pokemon-display');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

const pokemonName = document.getElementById('pokemon-name');
const pokemonId = document.getElementById('pokemon-id');
const pokemonImg = document.getElementById('pokemon-img');
const pokemonTypes = document.getElementById('pokemon-types');
const pokemonDescription = document.getElementById('pokemon-description');
const pokemonHeight = document.getElementById('pokemon-height');
const pokemonWeight = document.getElementById('pokemon-weight');
const pokemonAbilities = document.getElementById('pokemon-abilities');
const statsList = document.getElementById('stats-list');

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query) fetchPokemonData(query);
});

prevBtn.addEventListener('click', () => {
  if (currentPokemonId > 1) {
    fetchPokemonData(currentPokemonId - 1);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentPokemonId < 1025) {
    fetchPokemonData(currentPokemonId + 1);
  }
});

startGameBtn.addEventListener('click', () => {
  pokeballsWrapper.classList.remove('hidden');
  pokeballs.forEach(ball => ball.className = 'pokeball');
});

pokeballs.forEach(ball => {
  ball.addEventListener('click', (e) => {
    const selectedBall = e.currentTarget;
    selectedBall.classList.add('shake');

    setTimeout(() => {
      selectedBall.classList.remove('shake');
      selectedBall.classList.add('open');

      setTimeout(() => {
        const randomId = Math.floor(Math.random() * 1025) + 1;
        fetchPokemonData(randomId);
        pokeballsWrapper.classList.add('hidden');
      }, 500);
    }, 1000);
  });
});

async function fetchPokemonData(query) {
  try {
    const response = await fetch(`${API_URL}${query}`);
    if (!response.ok) throw new Error('Pokémon não encontrado.');
    const data = await response.json();

    const speciesResponse = await fetch(`${SPECIES_URL}${data.id}`);
    const speciesData = await speciesResponse.json();

    currentPokemonId = data.id;
    displayPokemon(data, speciesData);
  } catch (error) {
    alert(error.message);
  }
}

async function translateToPortuguese(text) {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`);
    const data = await res.json();
    return data.responseData.translatedText;
  } catch {
    return text; 
  }
}

async function displayPokemon(data, speciesData) {
  pokemonName.textContent = data.name;
  pokemonId.textContent = `#${data.id.toString().padStart(3, '0')}`;
  
  pokemonImg.src = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

  pokemonTypes.innerHTML = '';
  data.types.forEach(item => {
    const span = document.createElement('span');
    span.classList.add('type-badge');
    span.textContent = translateType[item.type.name] || item.type.name;
    pokemonTypes.appendChild(span);
  });

  const flavorTextObj = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
  const rawDescription = flavorTextObj ? flavorTextObj.flavor_text.replace(/[\n\f]/g, ' ') : '';
  
  pokemonDescription.textContent = "Traduzindo...";
  if (rawDescription) {
    const translatedText = await translateToPortuguese(rawDescription);
    pokemonDescription.textContent = translatedText;
  } else {
    pokemonDescription.textContent = 'Descrição não disponível.';
  }

  pokemonHeight.textContent = (data.height / 10).toFixed(1);
  pokemonWeight.textContent = (data.weight / 10).toFixed(1);
  pokemonAbilities.textContent = data.abilities.map(a => a.ability.name).join(', ');

  statsList.innerHTML = '';
  data.stats.forEach(stat => {
    const li = document.createElement('li');
    const statName = translateStat[stat.stat.name] || stat.stat.name;
    li.innerHTML = `<strong>${statName}:</strong> ${stat.base_stat}`;
    statsList.appendChild(li);
  });

  pokemonDisplay.classList.remove('hidden');
}
