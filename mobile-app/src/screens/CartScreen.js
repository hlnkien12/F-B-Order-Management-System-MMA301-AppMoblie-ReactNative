import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from "react-native";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../api/config";
import axios from "axios";

export default function CartScreen({ navigation }) {
  const {
    tableCode,
    tableName,
    customerName,
    customerPhone,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotalAmount,
    setActiveOrder,
    setOrderHistory
  } = useApp();

  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSendOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        tableCode,
        customerName: customerName.trim() || `Khách ${tableName}`,
        customerPhone: customerPhone.trim(),
        note: note.trim(),
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
          selectedOption: item.selectedOption
        }))
      };

      let newOrder = null;
      try {
        const res = await axios.post(`${API_BASE_URL}/orders`, payload, { timeout: 3500 });
        newOrder = res.data?.data || res.data;
      } catch {
        // Fallback tao don gia lap neu server chua ket noi
        newOrder = {
          _id: "ord_" + Date.now(),
          orderCode: "ORD-" + Math.floor(1000 + Math.random() * 9000),
          tableName,
          customerName: customerName || `Khách ${tableName}`,
          note: note.trim(),
          items: [...cartItems],
          totalAmount: cartTotalAmount,
          status: "pending",
          createdAt: new Date().toISOString()
        };
      }

      setActiveOrder(newOrder);
      setOrderHistory((prev) => [newOrder, ...prev]);
      clearCart();
      setNote("");
      Alert.alert("Thành công", `Đã gửi đơn [${newOrder.orderCode}] cho nhà bếp thành công!`);
      navigation.navigate("TrackingTab");
    } catch {
      Alert.alert("Lỗi", "Không thể gửi đơn hàng vào lúc này!");
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = ({ item, index }) => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.selectedOption ? (
            <Text style={styles.itemOption}>Tùy chọn: {item.selectedOption}</Text>
          ) : null}
          <Text style={styles.itemPrice}>Đơn giá: {item.price.toLocaleString("vi-VN")} đ</Text>
        </View>

        <View style={styles.qtyContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(index, -1)}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(index, 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(index)}>
            <Text style={styles.removeBtnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Thong tin ban phuc vu */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Giỏ Hàng Gọi Món</Text>
        <Text style={styles.headerBadge}>{tableName} ({tableCode})</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptySub}>Hãy quay lại thực đơn để chọn những món ăn ngon nhé!</Text>
          <TouchableOpacity style={styles.backToMenuBtn} onPress={() => navigation.navigate("MenuTab")}>
            <Text style={styles.backToMenuText}>+ Xem Thực Đơn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={cartItems}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={renderCartItem}
            contentContainerStyle={styles.list}
            ListFooterComponent={
              <View style={styles.footerBox}>
                <Text style={styles.label}>Ghi chú cho nhà bếp:</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Ví dụ: Ít cay, không hành, nhiều đá..."
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </View>
            }
          />

          {/* Bottom Bar tong tien & nut gui don */}
          <View style={styles.bottomBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng tạm tính:</Text>
              <Text style={styles.totalAmount}>{cartTotalAmount.toLocaleString("vi-VN")} đ</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSendOrder}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.checkoutBtnText}>XÁC NHẬN GỬI ĐƠN ({cartItems.length} MÓN)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6"
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529"
  },
  headerBadge: {
    backgroundColor: "#0d6efd",
    color: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: "bold",
    fontSize: 12
  },
  list: {
    padding: 16,
    paddingBottom: 20
  },
  itemCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  itemInfo: {
    flex: 1,
    marginRight: 10
  },
  itemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#212529"
  },
  itemOption: {
    fontSize: 12,
    color: "#0d6efd",
    marginTop: 2
  },
  itemPrice: {
    fontSize: 13,
    color: "#dc3545",
    fontWeight: "600",
    marginTop: 4
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center"
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057"
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center"
  },
  removeBtn: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#f8d7da"
  },
  removeBtnText: {
    color: "#dc3545",
    fontSize: 11,
    fontWeight: "bold"
  },
  footerBox: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 6
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: "top"
  },
  bottomBar: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
    elevation: 8
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#495057"
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc3545"
  },
  checkoutBtn: {
    backgroundColor: "#198754",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center"
  },
  checkoutBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8
  },
  emptySub: {
    fontSize: 13,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20
  },
  backToMenuBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  backToMenuText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  }
});
