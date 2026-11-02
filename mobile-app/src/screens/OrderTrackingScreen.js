import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput
} from "react-native";
import { useApp } from "../context/AppContext";
import { API_BASE_URL, SOCKET_URL } from "../api/config";
import axios from "axios";
import { io } from "socket.io-client";

const STATUS_STEPS = [
  { key: "pending", label: "1. Đã gửi" },
  { key: "confirmed", label: "2. Đang làm" },
  { key: "served", label: "3. Đã lên món" },
  { key: "completed", label: "4. Hoàn tất" }
];

export default function OrderTrackingScreen({ navigation }) {
  const { activeOrder, setActiveOrder, setOrderHistory } = useApp();

  const [feedbackModal, setFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [issueCategory, setIssueCategory] = useState("none");
  const [comment, setComment] = useState("");

  // Ket noi Socket.IO realtime
  useEffect(() => {
    if (!activeOrder?._id) return;

    let socket;
    try {
      socket = io(SOCKET_URL, { transports: ["websocket"], timeout: 3000 });
      socket.emit("order:join", activeOrder._id);

      socket.on("order:updated", (payload) => {
        if (payload && String(payload.id) === String(activeOrder._id)) {
          setActiveOrder((prev) => (prev ? { ...prev, ...payload } : prev));
        }
      });
    } catch {
      // Bo qua neu socket server chua bat
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [activeOrder?._id]);

  const handleCancelOrder = async () => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.post(`${API_BASE_URL}/orders/${activeOrder._id}/cancel`, {
                reason: "Khách hàng tự hủy trên ứng dụng"
              });
            } catch {
              // local fallback
            }
            const updated = { ...activeOrder, status: "cancelled", cancelReason: "Khách hàng tự hủy trên ứng dụng" };
            setActiveOrder(updated);
            setOrderHistory((prev) =>
              prev.map((o) => (o._id === activeOrder._id ? updated : o))
            );
            Alert.alert("Thành công", "Đã hủy đơn hàng thành công!");
          }
        }
      ]
    );
  };

  const handleCallPayment = async () => {
    try {
      await axios.post(`${API_BASE_URL}/orders/request-payment`, {
        orderIds: [activeOrder._id],
        paymentMethod: "cash"
      });
    } catch {
      // local fallback
    }
    setActiveOrder((prev) => ({ ...prev, paymentRequested: true }));
    Alert.alert("Đã gửi yêu cầu", "Nhân viên thu ngân sẽ đến bàn của bạn ngay!");
  };

  const handleSubmitFeedback = async () => {
    const isBad = Number(rating) <= 2 || issueCategory !== "none";
    if (isBad && !comment.trim()) {
      Alert.alert("Yêu cầu", "Vui lòng nhập nội dung phản hồi chi tiết để quán kịp thời hỗ trợ!");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/orders/${activeOrder._id}/feedback`, {
        rating: Number(rating),
        issueCategory,
        comment: comment.trim()
      });
    } catch {
      // local fallback
    }

    const feedbackObj = {
      rating: Number(rating),
      issueCategory,
      comment: comment.trim(),
      isBadFeedback: isBad,
      submittedAt: new Date().toISOString()
    };
    setActiveOrder((prev) => ({ ...prev, feedback: feedbackObj }));
    setFeedbackModal(false);
    Alert.alert("Cảm ơn", "Cảm ơn bạn đã gửi đánh giá dịch vụ!");
  };

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào đang theo dõi</Text>
          <Text style={styles.emptySub}>Hãy vào thực đơn để chọn món và gửi đơn cho nhà bếp nhé!</Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate("MenuTab")}>
            <Text style={styles.menuBtnText}>Vào Thực Đơn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex =
    activeOrder.status === "cancelled"
      ? -1
      : STATUS_STEPS.findIndex((s) => s.key === activeOrder.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header don hang */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.codeText}>{activeOrder.orderCode}</Text>
            <Text style={[styles.statusBadge, activeOrder.status === "cancelled" ? styles.bgDanger : styles.bgPrimary]}>
              {activeOrder.status === "pending" && "Chờ quán xác nhận"}
              {activeOrder.status === "confirmed" && "Bếp đang chuẩn bị"}
              {activeOrder.status === "served" && "Đã lên món tại bàn"}
              {activeOrder.status === "completed" && "Đã thanh toán xong"}
              {activeOrder.status === "cancelled" && "Đơn đã bị hủy"}
            </Text>
          </View>
          <Text style={styles.tableText}>Bàn phục vụ: {activeOrder.tableName}</Text>
        </View>

        {/* Thanh tien do 4 buoc */}
        {activeOrder.status !== "cancelled" && (
          <View style={styles.stepperCard}>
            <Text style={styles.sectionLabel}>Tiến độ phục vụ:</Text>
            <View style={styles.stepperRow}>
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isPassed && styles.stepDotPassed,
                        isCurrent && styles.stepDotCurrent
                      ]}
                    >
                      <Text style={[styles.stepNum, isPassed && styles.stepNumPassed]}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isPassed && styles.stepLabelPassed,
                        isCurrent && styles.stepLabelCurrent
                      ]}
                      numberOfLines={1}
                    >
                      {step.label.replace(/^[0-9]\.\s*/, "")}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Canh bao Huy don / Hoan tien */}
        {activeOrder.status === "cancelled" && (
          <View style={styles.dangerAlert}>
            <Text style={styles.dangerTitle}>Đơn hàng đã bị hủy</Text>
            <Text style={styles.dangerSub}>
              Lý do: {activeOrder.cancelReason || "Không có lý do chi tiết."}
            </Text>
          </View>
        )}

        {activeOrder.voidRefund?.isProcessed && (
          <View style={styles.warningAlert}>
            <Text style={styles.warningTitle}>
              {activeOrder.voidRefund.actionType === "void" ? "Đơn hàng đã được Miễn Thu (Void)" : "Đã Hoàn Tiền Sự Cố"}
            </Text>
            <Text style={styles.warningSub}>
              Số tiền hoàn lại: {activeOrder.voidRefund.refundAmount?.toLocaleString("vi-VN")} đ
            </Text>
            <Text style={styles.warningSub}>
              Lý do: {activeOrder.voidRefund.reason}
            </Text>
          </View>
        )}

        {/* Danh sach mon trong don */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Danh sách món đã gọi:</Text>
          {(activeOrder.items || []).map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNameText}>{item.name}</Text>
                {item.selectedOption ? (
                  <Text style={styles.itemOptText}>({item.selectedOption})</Text>
                ) : null}
              </View>
              <Text style={styles.itemQtyText}>x{item.quantity}</Text>
              <Text style={styles.itemPriceText}>
                {((item.price || 0) * item.quantity).toLocaleString("vi-VN")} đ
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>
              {(activeOrder.totalAmount || 0).toLocaleString("vi-VN")} đ
            </Text>
          </View>
        </View>

        {/* Danh gia cua khach */}
        {activeOrder.feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Đánh giá của bạn: {activeOrder.feedback.rating} Sao</Text>
            {activeOrder.feedback.comment ? (
              <Text style={styles.feedbackComment}>"{activeOrder.feedback.comment}"</Text>
            ) : null}
          </View>
        )}

        {/* Cac nut hanh dong */}
        <View style={styles.actionGroup}>
          {activeOrder.status === "pending" && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
              <Text style={styles.cancelBtnText}>HỦY ĐƠN HÀNG</Text>
            </TouchableOpacity>
          )}

          {["confirmed", "served"].includes(activeOrder.status) && (
            <TouchableOpacity
              style={[styles.paymentBtn, activeOrder.paymentRequested && { backgroundColor: "#ffc107" }]}
              onPress={handleCallPayment}
              disabled={activeOrder.paymentRequested}
            >
              <Text style={[styles.paymentBtnText, activeOrder.paymentRequested && { color: "#000" }]}>
                {activeOrder.paymentRequested ? "ĐÃ GỌI NHÂN VIÊN THANH TOÁN" : "GỌI THANH TOÁN TẠI BÀN"}
              </Text>
            </TouchableOpacity>
          )}

          {["served", "completed"].includes(activeOrder.status) && (
            <TouchableOpacity style={styles.reviewBtn} onPress={() => setFeedbackModal(true)}>
              <Text style={styles.reviewBtnText}>
                {activeOrder.feedback ? "SỬA ĐÁNH GIÁ / KHIẾU NẠI" : "ĐÁNH GIÁ / KHIẾU NẠI DỊCH VỤ"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.orderMoreBtn} onPress={() => navigation.navigate("MenuTab")}>
            <Text style={styles.orderMoreText}>+ Đặt Thêm Món Khác</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Gui Danh Gia */}
      <Modal visible={feedbackModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Đánh Giá / Phản Hồi Dịch Vụ</Text>

            <Text style={styles.modalSub}>Chọn số sao hài lòng:</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.starBtn, rating === s && styles.starBtnActive]}
                  onPress={() => setRating(s)}
                >
                  <Text style={[styles.starText, rating === s && styles.starTextActive]}>{s} Sao</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSub}>Phân loại sự cố (nếu có):</Text>
            <View style={styles.catGrid}>
              {[
                { k: "none", l: "Hài lòng" },
                { k: "staff", l: "Lỗi nhân viên" },
                { k: "ingredient", l: "Lỗi món ăn/nguyên liệu" },
                { k: "both", l: "Cả hai" }
              ].map((c) => (
                <TouchableOpacity
                  key={c.k}
                  style={[styles.catPill, issueCategory === c.k && styles.catPillActive]}
                  onPress={() => setIssueCategory(c.k)}
                >
                  <Text style={[styles.catPillText, issueCategory === c.k && styles.catPillTextActive]}>
                    {c.l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSub}>Nhận xét chi tiết:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập trải nghiệm hoặc sự cố để quán hỗ trợ..."
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.mCancelBtn} onPress={() => setFeedbackModal(false)}>
                <Text style={styles.mCancelText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mSubmitBtn} onPress={handleSubmitFeedback}>
                <Text style={styles.mSubmitText}>Gửi Đánh Giá</Text>
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
  scroll: {
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
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  codeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d6efd"
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold"
  },
  bgPrimary: {
    backgroundColor: "#0d6efd"
  },
  bgDanger: {
    backgroundColor: "#dc3545"
  },
  tableText: {
    fontSize: 14,
    color: "#495057",
    marginTop: 6
  },
  stepperCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10
  },
  stepperRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  stepItem: {
    alignItems: "center",
    width: "23%"
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4
  },
  stepDotPassed: {
    backgroundColor: "#0d6efd"
  },
  stepDotCurrent: {
    borderWidth: 2,
    borderColor: "#0a58ca"
  },
  stepNum: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6c757d"
  },
  stepNumPassed: {
    color: "#ffffff"
  },
  stepLabel: {
    fontSize: 11,
    color: "#6c757d",
    textAlign: "center"
  },
  stepLabelPassed: {
    color: "#0d6efd",
    fontWeight: "bold"
  },
  stepLabelCurrent: {
    color: "#0a58ca",
    fontWeight: "bold"
  },
  dangerAlert: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f5c2c7"
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#842029"
  },
  dangerSub: {
    fontSize: 12,
    color: "#842029",
    marginTop: 2
  },
  warningAlert: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffecb5"
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#664d03"
  },
  warningSub: {
    fontSize: 12,
    color: "#664d03",
    marginTop: 2
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5"
  },
  itemNameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529"
  },
  itemOptText: {
    fontSize: 11,
    color: "#0d6efd"
  },
  itemQtyText: {
    fontSize: 13,
    color: "#495057",
    marginHorizontal: 12
  },
  itemPriceText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#212529"
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6"
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#212529"
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#dc3545"
  },
  feedbackCard: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#c8e6c9"
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2e7d32"
  },
  feedbackComment: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#1b5e20",
    marginTop: 2
  },
  actionGroup: {
    gap: 10,
    marginTop: 6,
    marginBottom: 30
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  cancelBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  },
  paymentBtn: {
    backgroundColor: "#198754",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  paymentBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  },
  reviewBtn: {
    backgroundColor: "#fd7e14",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  reviewBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14
  },
  orderMoreBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#0d6efd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  orderMoreText: {
    color: "#0d6efd",
    fontWeight: "bold",
    fontSize: 14
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12
  },
  modalSub: {
    fontSize: 13,
    fontWeight: "600",
    color: "#495057",
    marginTop: 8,
    marginBottom: 6
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  starBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#e9ecef"
  },
  starBtnActive: {
    backgroundColor: "#ffc107"
  },
  starText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#495057"
  },
  starTextActive: {
    color: "#000000"
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  catPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#f1f3f5"
  },
  catPillActive: {
    backgroundColor: "#dc3545"
  },
  catPillText: {
    fontSize: 12,
    color: "#495057"
  },
  catPillTextActive: {
    color: "#ffffff",
    fontWeight: "bold"
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: "top",
    fontSize: 13
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16
  },
  mCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#6c757d"
  },
  mCancelText: {
    color: "#ffffff",
    fontWeight: "bold"
  },
  mSubmitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#0d6efd"
  },
  mSubmitText: {
    color: "#ffffff",
    fontWeight: "bold"
  }
});
