import { dataGridZod } from "@/components/dataGridServerSide/zodTypes";
import { protectedProcedure, router } from "..";

const projectManagementRouter = router({
  list: protectedProcedure
    .input(dataGridZod)
    .query(async (opts) => await opts.ctx.db.project.paginate({}, opts.input)),
});

export default projectManagementRouter;
