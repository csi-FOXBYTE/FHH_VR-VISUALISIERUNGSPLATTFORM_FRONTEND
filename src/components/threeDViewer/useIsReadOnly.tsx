import { useViewerStore } from "./ViewerProvider";

export default function useIsReadOnly() {
    const isReadOnly = useViewerStore(state => state.project.isReadOnly);

    return isReadOnly;
}