import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from "react-native";
import { useApp } from "../context/AppContext";

export default function OrderHistoryScreen({ navigation }) {
  const { orderHistory, setActiveOrder, tableName } = useApp();

  const handleSelectOrder = (order) => {
    setActiveOrder(order);
    navigation.navigate("TrackingTab");
  };

  const renderOrderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderCode}>{item.orderCode}</Text>
          <Text style={[styles.statusBadge, item.status === "completed" ? styles.bgSuccess : styles.bgWarning]}>
            {item.status === "pending" && "Chờ xác nhận"}
            {item.status === "confirmed" && "Đang làm"}
            {item.status === "served" && "Đã phục vụ"}
            {item.status === "completed" && "Đã thanh toán"}
            {item.status === "cancelled" && "Đã hủy"}
          </Text>
        </View>

        <Text style={styles.timeText}>
          Giờ đặt: {item.createdAt ? new Date(item.createdAt).toLocaleTimeString("vi-VN") : "Hôm nay"}
        </Text>

        <View style={styles.itemsSummary}>
          {(item.items || []).map((i, idx) => (
            <Text key={idx} style={styles.itemLine}>
              - {i.name} {i.selectedOption ? `(${i.selectedOption})` : ""} x{i.quantity}
            </Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalText}>
            Tổng: {(item.totalAmount || 0).toLocaleString("vi-VN")} đ
          </Text>
          <TouchableOpacity style={styles.detailBtn} onPress={() => handleSelectOrder(item)}>
            <Text style={styles.detailBtnText}>Xem Chi Tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Lịch Sử Đơn Hàng</Text>
        <Text style={styles.headerSub}>{tableName}</Text>
      </View>

      {orderHistory.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Chưa có lịch sử đơn hàng</Text>
          <Text style={styles.emptySub}>
            Các đơn hàng bạn đã đặt trong ngày sẽ được lưu trữ và hiển thị tại đây.
          </Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate("MenuTab")}>
            <Text style={styles.menuBtnText}>Vào Thực Đơn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orderHistory}
          keyExtractor={(item, idx) => item._id || String(idx)}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
        />
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
  headerSub: {
    fontSize: 12,
    color: "#0d6efd",
    marginTop: 2
  },
  list: {
    padding: 16
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  orderCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0d6efd"
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff"
  },
  bgSuccess: {
    backgroundColor: "#198754"
  },
  bgWarning: {
    backgroundColor: "#fd7e14"
  },
  timeText: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 4
  },
  itemsSummary: {
    marginTop: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f3f5"
  },
  itemLine: {
    fontSize: 13,
    color: "#495057",
    marginVertical: 2
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  totalText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#dc3545"
  },
  detailBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  detailBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold"
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 6
  },
  emptySub: {
    fontSize: 13,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20
  },
  menuBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  menuBtnText: {
    color: "#ffffff",
    fontWeight: "bold"
  }
});
