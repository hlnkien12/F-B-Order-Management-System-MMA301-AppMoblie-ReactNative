import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from "react-native";
import { useApp } from "../context/AppContext";

const TABLES = [
  { code: "T01", name: "Bàn 01" },
  { code: "T02", name: "Bàn 02" },
  { code: "T03", name: "Bàn 03" },
  { code: "T04", name: "Bàn 04" },
  { code: "T05", name: "Bàn 05" },
  { code: "T06", name: "Bàn 06" }
];

export default function LoginScreen({ navigation }) {
  const { tableCode, setTableCode, setTableName, customerName, setCustomerName, customerPhone, setCustomerPhone } = useApp();
  const [selectedCode, setSelectedCode] = useState(tableCode);

  const handleStartOrder = () => {
    const table = TABLES.find((t) => t.code === selectedCode) || TABLES[0];
    setTableCode(table.code);
    setTableName(table.name);
    navigation.replace("MainTabs");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>F&B SMART ORDER</Text>
          <Text style={styles.subtitle}>Ứng Dụng Gọi Món Thông Minh Tại Bàn</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Chọn Bàn Ngồi Phục Vụ (*)</Text>
          <View style={styles.tableGrid}>
            {TABLES.map((t) => {
              const isSelected = t.code === selectedCode;
              return (
                <TouchableOpacity
                  key={t.code}
                  style={[styles.tableBtn, isSelected && styles.tableBtnActive]}
                  onPress={() => setSelectedCode(t.code)}
                >
                  <Text style={[styles.tableBtnText, isSelected && styles.tableBtnTextActive]}>
                    {t.name}
                  </Text>
                  <Text style={[styles.tableSubText, isSelected && styles.tableBtnTextActive]}>
                    {t.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>2. Thông Tin Khách Hàng (Tùy chọn)</Text>
          <Text style={styles.label}>Tên quý khách:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Anh Nam / Chị Linh..."
            value={customerName}
            onChangeText={setCustomerName}
          />

          <Text style={styles.label}>Số điện thoại:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 0912345678 (Tùy chọn)"
            keyboardType="phone-pad"
            value={customerPhone}
            onChangeText={setCustomerPhone}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleStartOrder}>
            <Text style={styles.submitBtnText}>VÀO THỰC ĐƠN GỌI MÓN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8"
  },
  content: {
    padding: 20
  },
  header: {
    alignItems: "center",
    marginVertical: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0d6efd",
    letterSpacing: 1
  },
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 6
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12
  },
  tableGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  tableBtn: {
    width: "31%",
    backgroundColor: "#e9ecef",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent"
  },
  tableBtnActive: {
    backgroundColor: "#0d6efd",
    borderColor: "#0a58ca"
  },
  tableBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#343a40"
  },
  tableSubText: {
    fontSize: 11,
    color: "#6c757d",
    marginTop: 2
  },
  tableBtnTextActive: {
    color: "#ffffff"
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: "#ffffff"
  },
  submitBtn: {
    backgroundColor: "#198754",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5
  }
});
