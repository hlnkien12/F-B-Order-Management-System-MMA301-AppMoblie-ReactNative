import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  Image,
  ActivityIndicator
} from "react-native";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api/config";
import axios from "axios";

const FALLBACK_MENU = [
  {
    _id: "m01",
    name: "Phở Bò Đặc Biệt",
    category: "food",
    price: 55000,
    description: "Thịt bò tái nạm, nước dùng hầm xương gia truyền 12 tiếng",
    options: [
      { label: "Thường", priceDelta: 0 },
      { label: "Đặc biệt", priceDelta: 15000 }
    ],
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500"
  },
  {
    _id: "m02",
    name: "Bún Đậu Mắm Tôm",
    category: "food",
    price: 45000,
    description: "Đậu rán giòn, chả cốm, nem rán ăn kèm rau thơm tươi",
    options: [
      { label: "Thường", priceDelta: 0 },
      { label: "Đặc biệt", priceDelta: 15000 }
    ],
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
  },
  {
    _id: "m03",
    name: "Trà Đào Cam Sả",
    category: "drink",
    price: 30000,
    description: "Đào miếng giòn ngọt, hương sả thanh mát và cam tươi",
    options: [
      { label: "Size M", priceDelta: 0 },
      { label: "Size L", priceDelta: 5000 },
      { label: "Size XL", priceDelta: 10000 }
    ],
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500"
  },
  {
    _id: "m04",
    name: "Trà Sữa Trân Châu Đường Đen",
    category: "drink",
    price: 35000,
    description: "Trà sữa đậm vị, trân châu dẻo thơm nấu đường đen tươi",
    options: [
      { label: "Size M", priceDelta: 0 },
      { label: "Size L", priceDelta: 5000 },
      { label: "Size XL", priceDelta: 10000 }
    ],
    imageUrl: "https://images.unsplash.com/photo-1558857563-b37cf5a932d8?w=500"
  },
  {
    _id: "m05",
    name: "Bánh Flan Caramen",
    category: "dessert",
    price: 18000,
    description: "Bánh flan mềm mịn, thơm mùi trứng sữa và sốt caramen",
    options: [{ label: "Thường", priceDelta: 0 }],
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500"
  }
];

const CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "food", label: "Món ăn" },
  { key: "drink", label: "Đồ uống" },
  { key: "dessert", label: "Tráng miệng" }
];

export default function MenuScreen({ navigation }) {
  const { tableName, addToCart, cartItems, cartTotalAmount } = useApp();
  const [menu, setMenu] = useState(FALLBACK_MENU);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/menu`, { timeout: 3000 });
      const items = res.data?.data || res.data;
      if (Array.isArray(items) && items.length > 0) {
        setMenu(items);
      }
    } catch {
      // Giu nguyen FALLBACK_MENU khi server chua bat
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menu.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (search.trim()) {
      return item.name.toLowerCase().includes(search.trim().toLowerCase());
    }
    return true;
  });

  const handleOpenOption = (item) => {
    setSelectedItem(item);
    const defaultOpt = item.options && item.options[0] ? item.options[0].label : "Thường";
    setSelectedOption(defaultOpt);
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, selectedOption);
      setSelectedItem(null);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" }}
          style={styles.image}
        />
        <View style={styles.cardBody}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {item.description || "Món ăn thơm ngon, chuẩn vị chế biến tươi trong ngày"}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price.toLocaleString("vi-VN")} đ</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenOption(item)}>
              <Text style={styles.addBtnText}>+ Chọn Món</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh Header thong tin ban */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTable}>{tableName}</Text>
          <Text style={styles.headerSub}>Thực đơn gọi món</Text>
        </View>
        <TouchableOpacity style={styles.cartBadgeBtn} onPress={() => navigation.navigate("CartTab")}>
          <Text style={styles.cartBadgeText}>Giỏ: {cartItems.length} món</Text>
        </TouchableOpacity>
      </View>

      {/* Thanh tim kiem */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn, đồ uống..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs danh muc */}
      <View style={styles.catTabs}>
        {CATEGORIES.map((c) => {
          const isActive = c.key === category;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.catBtn, isActive && styles.catBtnActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={[styles.catText, isActive && styles.catTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Danh sach mon */}
      {loading ? (
        <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item._id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy món ăn nào phù hợp.</Text>
          }
        />
      )}

      {/* Floating Bar gio hang */}
      {cartItems.length > 0 && (
        <TouchableOpacity style={styles.floatingCart} onPress={() => navigation.navigate("CartTab")}>
          <Text style={styles.floatingCartText}>
            Xem giỏ hàng ({cartItems.length} món) - {cartTotalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal chon tuy chon size / option */}
      <Modal visible={Boolean(selectedItem)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.modalBasePrice}>
              Giá gốc: {selectedItem?.price.toLocaleString("vi-VN")} đ
            </Text>

            <Text style={styles.modalSectionLabel}>Chọn kích cỡ / tùy chọn:</Text>
            {(selectedItem?.options || [{ label: "Thường", priceDelta: 0 }]).map((opt) => {
              const isSelected = selectedOption === opt.label;
              return (
                <TouchableOpacity
                  key={opt.label}
                  style={[styles.optionRow, isSelected && styles.optionRowActive]}
                  onPress={() => setSelectedOption(opt.label)}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                    {opt.label} {opt.priceDelta > 0 ? `(+${opt.priceDelta.toLocaleString("vi-VN")} đ)` : ""}
                  </Text>
                  <Text style={[styles.optionCheck, isSelected && styles.optionCheckActive]}>
                    {isSelected ? "[X]" : "[ ]"}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSelectedItem(null)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmAddToCart}>
                <Text style={styles.modalConfirmText}>Thêm Vào Giỏ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8"
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6"
  },
  headerTable: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d6efd"
  },
  headerSub: {
    fontSize: 12,
    color: "#6c757d"
  },
  cartBadgeBtn: {
    backgroundColor: "#198754",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  cartBadgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#ffffff"
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14
  },
  catTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6"
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e9ecef",
    marginRight: 8
  },
  catBtnActive: {
    backgroundColor: "#0d6efd"
  },
  catText: {
    fontSize: 13,
    color: "#495057",
    fontWeight: "600"
  },
  catTextActive: {
    color: "#ffffff"
  },
  list: {
    padding: 16,
    paddingBottom: 80
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: "#dee2e6"
  },
  cardBody: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between"
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#212529"
  },
  desc: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 2
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc3545"
  },
  addBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold"
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6c757d"
  },
  floatingCart: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#198754",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  floatingCartText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529"
  },
  modalBasePrice: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 16
  },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 10
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    marginBottom: 8
  },
  optionRowActive: {
    borderColor: "#0d6efd",
    backgroundColor: "#e7f1ff"
  },
  optionLabel: {
    fontSize: 14,
    color: "#343a40"
  },
  optionLabelActive: {
    color: "#0d6efd",
    fontWeight: "bold"
  },
  optionCheck: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "bold"
  },
  optionCheckActive: {
    color: "#0d6efd"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#6c757d"
  },
  modalCancelText: {
    color: "#ffffff",
    fontWeight: "bold"
  },
  modalConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#0d6efd"
  },
  modalConfirmText: {
    color: "#ffffff",
    fontWeight: "bold"
  }
});
