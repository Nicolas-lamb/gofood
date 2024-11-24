import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // Biblioteca de ícones

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [search, setSearch] = useState(""); // Estado para a pesquisa
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Estado para armazenar as informações do usuário
  const [showProfile, setShowProfile] = useState(false); // Estado para controlar a exibição do perfil
  const [selectedRestaurantFoods, setSelectedRestaurantFoods] = useState([]); // Estado para armazenar as comidas do restaurante selecionado
  const [showRestaurantFoods, setShowRestaurantFoods] = useState(false); // Estado para controlar a exibição das comidas do restaurante

  useEffect(() => {
    // Função para buscar restaurantes
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          "https://apifakedelivery.vercel.app/restaurants"
        );
        setRestaurants(response.data);
        setFilteredRestaurants(response.data); // Mostra todos os restaurantes inicialmente
      } catch (error) {
        console.error("Erro ao buscar os restaurantes:", error);
      } finally {
        setLoading(false);
      }
    };

    // Função para buscar o usuário
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://apifakedelivery.vercel.app/users/1"
        );
        setUser(response.data); // Atualiza o estado com as informações do usuário
      } catch (error) {
        console.error("Erro ao buscar o usuário:", error);
      }
    };

    fetchRestaurants();
    fetchUser(); // Chama a função para buscar o usuário
  }, []);

  // Função que atualiza os resultados da busca
  const handleSearch = (text) => {
    setSearch(text);
    if (text === "") {
      setFilteredRestaurants(restaurants); // Mostra todos os restaurantes caso o campo esteja vazio
    } else {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(text.toLowerCase()) // Filtra pelo nome
      );
      setFilteredRestaurants(filtered);
    }
  };

  // Função para pegar as comidas de um restaurante
  const fetchFoods = async (restaurantId) => {
    try {
      setShowProfile(false);
      const response = await axios.get("https://apifakedelivery.vercel.app/foods");
      // Filtra as comidas com base no restaurante
      const foods = response.data.filter(food => food.restaurantId === restaurantId);
      setSelectedRestaurantFoods(foods); // Atualiza o estado com as comidas
      setShowRestaurantFoods(true); // Exibe a lista de comidas
    } catch (error) {
      console.error("Erro ao buscar as comidas:", error);
    }
  };

  // Função para renderizar as estrelas
  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.floor(rating);
    const emptyStars = maxStars - filledStars;

    return (
      <View style={styles.starsContainer}>
        {Array(filledStars)
          .fill()
          .map((_, index) => (
            <Text key={`filled-${index}`} style={styles.starFilled}>
              ★
            </Text>
          ))}
        {Array(emptyStars)
          .fill()
          .map((_, index) => (
            <Text key={`empty-${index}`} style={styles.starEmpty}>
              ★
            </Text>
          ))}
      </View>
    );
  };

  // Função para alternar a exibição das comidas
  const toggleFoodsVisibility = () => {
    setShowRestaurantFoods(!showRestaurantFoods); // Alterna o estado de visibilidade
  };

  // Função para comprar comida
  const handlePurchase = (foodPrice) => {
    if (user.saldo >= foodPrice) {
      const newSaldo = user.saldo - foodPrice;
      setUser({ ...user, saldo: newSaldo }); // Atualiza o saldo do usuário
      alert("Compra realizada com sucesso!");
    } else {
      alert("Saldo insuficiente!");
    }
  };

  // Função para aumentar o saldo
  const increaseBalance = (amount) => {
    const newSaldo = Number(user.saldo) + amount;  // Converte saldo para número antes de somar
    setUser({ ...user, saldo: newSaldo }); // Atualiza o saldo do usuário
    alert(`Saldo aumentado em R$ ${amount}`);
};

  return (
    <View style={styles.container}>
      {/* Barra de pesquisa com ícone */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Pesquisar"
          value={search}
          onChangeText={handleSearch} // Atualiza a lista ao digitar
        />
        <TouchableOpacity style={styles.searchIcon}>
          <Ionicons name="search" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Lista de restaurantes */}
      {loading ? (
        <Text style={styles.loading}>Carregando...</Text>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => fetchFoods(item.id)} // Chama a função de pegar as comidas do restaurante ao clicar
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name.toUpperCase()}</Text>
                <Text style={styles.description}>{item.description}</Text>
                {renderStars(parseFloat(item.rating))}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Exibe as comidas do restaurante selecionado */}
      {showRestaurantFoods && (
        <View style={styles.foodsContainer}>
          <TouchableOpacity onPress={toggleFoodsVisibility} style={styles.toggleButton}>
            <Ionicons name="chevron-back" size={24} color="#888" />
          </TouchableOpacity>
          <FlatList
            data={selectedRestaurantFoods}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.foodCard}>
                <Image source={{ uri: item.image }} style={styles.foodImage} />
                <View style={styles.foodInfoContainer}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodDescription}>{item.description}</Text>
                  <Text style={styles.foodPrice}>R$ {parseFloat(item.price).toFixed(2)}</Text>
                  <Text style={styles.foodTime}>Tempo de entrega: {item.time}</Text>
                  <Text style={styles.foodDelivery}>Taxa de entrega: R$ {item.delivery.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handlePurchase(item.price)}
                  >
                    <Text style={styles.buyButtonText}>Comprar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* Barra de navegação */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setShowProfile(false)}>
          <Ionicons name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowRestaurantFoods(true)}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setShowProfile(true)} // Alterna a exibição do perfil
          >
            <Ionicons name="person" size={24} color="#fff" />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Exibindo o perfil do usuário */}
      {showProfile && user && (
        <View style={styles.profileContainer}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileSaldo}>Saldo: R$ {user.saldo}</Text>
          {/* Botão para aumentar o saldo */}
          <TouchableOpacity
            style={styles.increaseButton}
            onPress={() => increaseBalance(50)} // Aumenta o saldo em R$ 50
          >
            <Text style={styles.increaseButtonText}>Aumentar Saldo (R$ 50)</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 70, // Espaço adicional para a barra de navegação
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    right: 10,
  },
  loading: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  card: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starFilled: {
    color: "#ffbb33",
    fontSize: 18,
  },
  starEmpty: {
    color: "#ddd",
    fontSize: 18,
  },
  toggleButton: {
    padding: 10,
  },
  foodsContainer: {
    marginTop: 20,
  },
  foodCard: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  foodInfoContainer: {
    flex: 1,
    justifyContent: "center",
    
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  foodDescription: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  foodTime: {
    fontSize: 14,
    color: "#888",
  },
  foodDelivery: {
    fontSize: 14,
    color: "#888",
  },
  buyButton: {
    backgroundColor: "#222222",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buyButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
  profileContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 20,
    borderTopWidth: 4, // Define a largura da borda
    borderTopColor: "#000", // Define a cor da borda como preto
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: "#888",
    marginBottom: 10,
  },
  profileSaldo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  increaseButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  increaseButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
