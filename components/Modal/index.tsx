import { appState, closeModal } from "@/services/redux/reducers/app";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "../Icon";
import { ModalContent } from "./services";

export const CustomModal = () => {
  const dispatch = useDispatch();
  const { modal } = useSelector(appState);

  const { show, type, data } = modal;
  const hideModal = () => dispatch(closeModal());
  const Component = type ? ModalContent[type] : null;
  return (
    <Portal>
      <Modal
        visible={show}
        onDismiss={hideModal}
        style={styles.modal}
        contentContainerStyle={styles.container}
      >
        {data?.close !== false && (
          <TouchableOpacity onPress={hideModal} style={styles.close}>
            <Icon name="close" />
          </TouchableOpacity>
        )}
        {!!Component && <Component />}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: { height: "100%", backgroundColor: "rgba(0, 0, 0, .6)" },
  container: {
    height: "100%",
    width: "100%",
    alignSelf: "center",
  },
  close: {
    padding: 7,
    backgroundColor: "#f5f5f5",
    borderRadius: "50%",
    position: "absolute",
    top: 35,
    right: 20,
  },
});
